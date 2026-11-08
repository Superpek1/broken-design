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
      // 0. Verify seller account status in database (ensure account is active and not suspended)
      try {
        const userCheck = await db.query(
          `SELECT id, role, is_seller, suspended_at FROM users WHERE id = $1`,
          [req.user!.id]
        );

        if (userCheck.rows.length > 0) {
          const dbUser = userCheck.rows[0];
          if (dbUser.suspended_at !== null) {
            throw new AppError(
              403,
              'ACCOUNT_SUSPENDED',
              'Your account has been suspended by an administrator. Upload access is blocked.'
            );
          }
          if (!dbUser.is_seller && dbUser.role !== 'creator' && dbUser.role !== 'admin') {
            throw new AppError(
              403,
              'FORBIDDEN',
              'Seller access is disabled for this account.'
            );
          }
        }
      } catch (err) {
        if (err instanceof AppError) throw err;
      }

      // 1. Extract and validate metadata upfront
      const {
        title,
        description = '',
        tags = '[]',
        license = 'CC0',
        price_cents = 0,
        currency = 'USD',
      } = req.body;

      if (!title || typeof title !== 'string' || title.trim() === '') {
        throw new AppError(400, 'BAD_REQUEST', 'Model title is required');
      }

      // Validate License Enum against Postgres license_type enum ('CC0', 'CC-BY', 'CC-BY-NC', 'COMMERCIAL')
      const VALID_LICENSES = ['CC0', 'CC-BY', 'CC-BY-NC', 'COMMERCIAL'] as const;
      const normalizedLicense = String(license || 'CC0').trim().toUpperCase();
      if (!VALID_LICENSES.includes(normalizedLicense as any)) {
        throw new AppError(
          400,
          'INVALID_LICENSE',
          `Invalid license: "${license}". Allowed values: ${VALID_LICENSES.join(', ')}`
        );
      }

      const parsedPrice = Math.max(0, parseInt(String(price_cents), 10) || 0);

      // Business Rule (project.md Section 5): Paid models MUST have a preview GLB file for public rotation
      const previewFile = files?.['preview']?.[0];
      if (parsedPrice > 0 && !previewFile) {
        throw new AppError(
          400,
          'PREVIEW_REQUIRED',
          'Paid models require a lightweight preview GLB file (under 5 MB) for public rotation'
        );
      }

      // 2. Validate and inspect main GLB file
      const modelFile = files?.['file']?.[0];
      if (!modelFile) {
        throw new AppError(400, 'BAD_REQUEST', 'Main GLB file is required');
      }

      if (modelFile.size > env.maxModelSizeBytes) {
        throw new AppError(413, 'FILE_TOO_LARGE', `Model file exceeds maximum limit of ${env.maxModelSizeBytes} bytes`);
      }

      const validation = await validateGlbFile(modelFile.path);
      if (!validation.valid) {
        throw new AppError(400, 'INVALID_GLB', validation.reason || 'File is not a valid Binary glTF (GLB v2)');
      }

      const storage = getStorage();

      // Store main model by content hash
      const fileHash = await computeFileSha256(modelFile.path);
      await storage.put(`${fileHash}.glb`, modelFile.path);

      // 3. Process preview file (if provided or required for paid model)
      let previewHash: string | null = null;
      if (previewFile) {
        if (previewFile.size > env.maxPreviewSizeBytes) {
          throw new AppError(413, 'FILE_TOO_LARGE', `Preview file exceeds limit of ${env.maxPreviewSizeBytes} bytes`);
        }
        const previewValidation = await validateGlbFile(previewFile.path);
        if (!previewValidation.valid) {
          throw new AppError(400, 'INVALID_GLB', 'Preview file is not a valid GLB (glTF v2)');
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
        const allowedMime = ['image/webp', 'image/png', 'image/jpeg'];
        const ext = path.extname(posterFile.originalname).toLowerCase();
        if (!allowedMime.includes(posterFile.mimetype) && !['.webp', '.png', '.jpg', '.jpeg'].includes(ext)) {
          throw new AppError(400, 'INVALID_POSTER', 'Poster must be a valid image file (.webp, .png, or .jpg)');
        }
        posterHash = await computeFileSha256(posterFile.path);
        await storage.put(`${posterHash}.webp`, posterFile.path);
      }

      // 5. Sanitize Tags
      let parsedTags: string[] = [];
      if (Array.isArray(tags)) {
        parsedTags = tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
      } else if (typeof tags === 'string') {
        try {
          const parsed = JSON.parse(tags);
          parsedTags = Array.isArray(parsed)
            ? parsed.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
            : [tags.trim().toLowerCase()];
        } catch {
          parsedTags = tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
        }
      }
      parsedTags = Array.from(new Set(parsedTags));

      const ownerId = req.user!.id;
      const parsedCurrency = String(currency || 'USD').trim().toUpperCase().slice(0, 3);

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
          normalizedLicense,
          fileHash,
          modelFile.size,
          previewHash,
          posterHash,
          parsedPrice,
          parsedCurrency,
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
