import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import { env } from '../../config/env';
import { db } from '../../config/db';
import { getStorage } from '../../storage';
import { validateGlbFile, computeFileSha256 } from '../../utils/glbValidator';
import { requireAuth, requireSeller } from '../../middlewares/auth.middleware';
import { AppError } from '../../middlewares/error.middleware';

export const uploadRouter = Router();

// Ensure temporary upload directory exists
fs.mkdirSync(path.resolve(env.tmpUploadDir), { recursive: true });

const storageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(env.tmpUploadDir));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storageEngine,
  limits: {
    fileSize: env.maxModelSizeBytes, // 50MB maximum
  },
});

const uploadFields = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'preview', maxCount: 1 },
  { name: 'poster', maxCount: 1 },
]);

// Helper to remove temporary files
async function cleanupFiles(files?: { [fieldname: string]: Express.Multer.File[] }) {
  if (!files) return;
  for (const field of Object.keys(files)) {
    for (const file of files[field]) {
      await fsp.unlink(file.path).catch(() => undefined);
    }
  }
}

// POST /api/models (Upload 3D Asset: file, preview?, poster?, metadata)
uploadRouter.post(
  '/models',
  requireAuth,
  requireSeller,
  uploadFields,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    try {
      const modelFile = files?.['file']?.[0];
      if (!modelFile) {
        throw new AppError(400, 'BAD_REQUEST', 'Main GLB file is required');
      }

      // Check file size against env limit
      if (modelFile.size > env.maxModelSizeBytes) {
        throw new AppError(413, 'FILE_TOO_LARGE', `Model file exceeds maximum limit of ${env.maxModelSizeBytes} bytes`);
      }

      // 1. Validate main GLB magic bytes and header
      const validation = await validateGlbFile(modelFile.path);
      if (!validation.valid) {
        throw new AppError(400, 'INVALID_GLB', validation.reason || 'File is not a valid Binary glTF (GLB v2)');
      }

      const storage = getStorage();

      // 2. Compute SHA-256 hash (fingerprint) of main model file and store
      const fileHash = await computeFileSha256(modelFile.path);
      await storage.put(`${fileHash}.glb`, modelFile.path);

      // 3. Process preview file (optional)
      let previewHash: string | null = null;
      const previewFile = files?.['preview']?.[0];
      if (previewFile) {
        if (previewFile.size > env.maxPreviewSizeBytes) {
          throw new AppError(413, 'FILE_TOO_LARGE', `Preview file exceeds limit of ${env.maxPreviewSizeBytes} bytes`);
        }
        const previewValidation = await validateGlbFile(previewFile.path);
        if (!previewValidation.valid) {
          throw new AppError(400, 'INVALID_GLB', 'Preview file is not a valid GLB');
        }
        previewHash = await computeFileSha256(previewFile.path);
        await storage.put(`${previewHash}.glb`, previewFile.path);
      }

      // 4. Process poster image (optional)
      let posterHash: string | null = null;
      const posterFile = files?.['poster']?.[0];
      if (posterFile) {
        if (posterFile.size > env.maxPosterSizeBytes) {
          throw new AppError(413, 'FILE_TOO_LARGE', `Poster file exceeds limit of ${env.maxPosterSizeBytes} bytes`);
        }
        posterHash = await computeFileSha256(posterFile.path);
        await storage.put(`${posterHash}.webp`, posterFile.path);
      }

      // 5. Extract metadata from body
      const {
        title,
        description = '',
        tags = '[]',
        license = 'CC0',
        price_cents = 0,
        currency = 'USD',
      } = req.body;

      if (!title || typeof title !== 'string' || title.trim() === '') {
        throw new AppError(400, 'BAD_REQUEST', 'Title is required');
      }

      let parsedTags: string[] = [];
      if (Array.isArray(tags)) {
        parsedTags = tags.map((t) => String(t).trim()).filter(Boolean);
      } else if (typeof tags === 'string') {
        try {
          const parsed = JSON.parse(tags);
          parsedTags = Array.isArray(parsed) ? parsed : [tags];
        } catch {
          parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
        }
      }

      const parsedPrice = Math.max(0, parseInt(String(price_cents), 10) || 0);
      const ownerId = req.user!.id;

      // 6. Insert record into database
      const result = await db.query(
        `INSERT INTO models (
          owner_id, title, description, tags, license,
          file_hash, file_size, preview_hash, poster_hash,
          price_cents, currency
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          ownerId,
          title.trim(),
          description.trim(),
          parsedTags,
          license,
          fileHash,
          modelFile.size,
          previewHash,
          posterHash,
          parsedPrice,
          currency.toUpperCase(),
        ]
      );

      res.status(201).json({
        message: 'Model uploaded successfully',
        model: result.rows[0],
      });
    } catch (err) {
      await cleanupFiles(files);
      next(err);
    }
  }
);
