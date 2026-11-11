import { Router } from 'express';
import { db } from '../../config/db';
import { env } from '../../config/env';
import { requireAuth } from '../../middlewares/auth.middleware';
import { AppError } from '../../middlewares/error.middleware';

export const modelsRouter = Router();

const VALID_LICENSES = new Set(['CC0', 'CC-BY', 'CC-BY-NC', 'COMMERCIAL']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_PAGE_SIZE = 48;
const MAX_PAGE_SIZE = 100;

interface ModelRow {
  id: string;
  owner_id: string;
  creator: string;
  title: string;
  description: string | null;
  tags: string[];
  license: string;
  file_hash: string;
  file_size: string | number;
  preview_hash: string | null;
  poster_hash: string | null;
  price_cents: number;
  currency: string;
  view_count: string | number;
  download_count: string | number;
  like_count: string | number;
  created_at: Date | string;
}

function formatModelResponse(row: ModelRow) {
  const isPaid = row.price_cents > 0;
  const baseCdn = `${env.cdnServiceUrl}/cdn/models/${row.id}`;

  return {
    id: row.id,
    ownerId: row.owner_id,
    creator: row.creator,
    title: row.title,
    description: row.description ?? '',
    tags: row.tags ?? [],
    license: row.license,
    priceCents: Number(row.price_cents),
    currency: row.currency,
    fileSize: Number(row.file_size),
    viewCount: Number(row.view_count),
    downloadCount: Number(row.download_count),
    likeCount: Number(row.like_count),
    posterUrl: row.poster_hash ? `${baseCdn}/poster.webp` : undefined,
    previewUrl: row.preview_hash ? `${baseCdn}/${row.preview_hash}.glb` : undefined,
    // ห้ามส่งลิงก์ไฟล์เต็มของโมเดลเสียเงิน
    fileUrl: isPaid ? undefined : `${baseCdn}/${row.file_hash}.glb`,
    createdAt: row.created_at,
  };
}

// [Member 4] GET /api/models?q=&tag=&license=&price=free|paid&page=
modelsRouter.get('/', async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const tag = typeof req.query.tag === 'string' ? req.query.tag.trim().toLowerCase() : '';
    const license = typeof req.query.license === 'string' ? req.query.license.trim().toUpperCase() : '';
    const price = typeof req.query.price === 'string' ? req.query.price.trim().toLowerCase() : '';

    const rawPage = Number.parseInt(String(req.query.page ?? '1'), 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

    const rawPageSize = Number.parseInt(String(req.query.pageSize ?? req.query.limit ?? DEFAULT_PAGE_SIZE), 10);
    const pageSize =
      Number.isFinite(rawPageSize) && rawPageSize > 0
        ? Math.min(rawPageSize, MAX_PAGE_SIZE)
        : DEFAULT_PAGE_SIZE;

    // เฉพาะโมเดลที่ไม่ถูกซ่อน ไม่ถูกลบ และเจ้าของไม่ถูกระงับ
    const conditions: string[] = [
      'm.hidden_at IS NULL',
      'm.deleted_at IS NULL',
      'u.suspended_at IS NULL',
    ];
    const params: unknown[] = [];

    if (q) {
      params.push(`%${q}%`);
      conditions.push(`(m.title ILIKE $${params.length} OR m.description ILIKE $${params.length})`);
    }

    if (tag) {
      params.push(tag);
      conditions.push(`$${params.length} = ANY(m.tags)`);
    }

    if (license && VALID_LICENSES.has(license)) {
      params.push(license);
      conditions.push(`m.license = $${params.length}::license_type`);
    }

    if (price === 'free') {
      conditions.push('m.price_cents = 0');
    } else if (price === 'paid') {
      conditions.push('m.price_cents > 0');
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total
       FROM models m
       JOIN users u ON u.id = m.owner_id
       ${whereClause}`,
      params,
    );
    const total = Number.parseInt(countResult.rows[0]?.total ?? '0', 10);

    const offset = (page - 1) * pageSize;
    const listParams = [...params, pageSize, offset];

    const listResult = await db.query<ModelRow>(
      `SELECT
         m.id,
         m.owner_id,
         u.display_name AS creator,
         m.title,
         m.description,
         m.tags,
         m.license,
         m.file_hash,
         m.file_size,
         m.preview_hash,
         m.poster_hash,
         m.price_cents,
         m.currency,
         m.view_count,
         m.download_count,
         (SELECT COUNT(*) FROM likes l WHERE l.model_id = m.id) AS like_count,
         m.created_at
       FROM models m
       JOIN users u ON u.id = m.owner_id
       ${whereClause}
       ORDER BY m.created_at DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams,
    );

    res.json({
      items: listResult.rows.map(formatModelResponse),
      page,
      pageSize,
      total,
    });
  } catch (err) {
    next(err);
  }
});

// [Member 3 & 5] GET /api/models/:id
modelsRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!UUID_RE.test(id)) {
      throw new AppError(404, 'MODEL_NOT_FOUND', 'Model not found');
    }

    const result = await db.query<ModelRow>(
      `SELECT
         m.id,
         m.owner_id,
         u.display_name AS creator,
         m.title,
         m.description,
         m.tags,
         m.license,
         m.file_hash,
         m.file_size,
         m.preview_hash,
         m.poster_hash,
         m.price_cents,
         m.currency,
         m.view_count,
         m.download_count,
         (SELECT COUNT(*) FROM likes l WHERE l.model_id = m.id) AS like_count,
         m.created_at
       FROM models m
       JOIN users u ON u.id = m.owner_id
       WHERE m.id = $1
         AND m.hidden_at IS NULL
         AND m.deleted_at IS NULL
         AND u.suspended_at IS NULL`,
      [id],
    );

    const row = result.rows[0];
    if (!row) {
      throw new AppError(404, 'MODEL_NOT_FOUND', 'Model not found');
    }

    res.json(formatModelResponse(row));
  } catch (err) {
    next(err);
  }
});

// [Member 3] PATCH /api/models/:id (Update metadata)
modelsRouter.patch('/:id', requireAuth, async (req, res) => {
  res.json({ message: `TODO [Member 3]: Update model ${req.params.id}` });
});

// [Member 3] DELETE /api/models/:id (Soft delete if purchased)
modelsRouter.delete('/:id', requireAuth, async (req, res) => {
  res.json({ message: `TODO [Member 3]: Soft delete model ${req.params.id}` });
});

