import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../config/db';
import { requireAuth } from '../../middlewares/auth.middleware';
import { AppError } from '../../middlewares/error.middleware';

export const modelsRouter = Router();

// [Member 4] GET /api/models?q=&tag=&license=&price=free|paid&page=
modelsRouter.get('/', async (_req, res) => {
  res.json({ items: [], page: 1, total: 0 });
});

// [Member 3 & 5] GET /api/models/:id
modelsRouter.get('/:id', async (req, res) => {
  res.json({ id: req.params.id, title: 'Sample 3D Asset' });
});

// [Member 3] PATCH /api/models/:id (Update metadata)
modelsRouter.patch('/:id', requireAuth, async (req, res) => {
  res.json({ message: `TODO [Member 3]: Update model ${req.params.id}` });
});

// [Ham] DELETE /api/models/:id (Soft delete: only owner or admin can delete)
modelsRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // 0. Ensure user account is not suspended
    const userCheck = await db.query(
      `SELECT suspended_at FROM users WHERE id = $1`,
      [userId]
    );
    if (userCheck.rows.length > 0 && userCheck.rows[0].suspended_at !== null) {
      throw new AppError(403, 'ACCOUNT_SUSPENDED', 'Your account has been suspended by an administrator');
    }

    // 1. Find model and verify existence
    const findResult = await db.query(
      `SELECT id, owner_id, deleted_at FROM models WHERE id = $1`,
      [id]
    );

    if (findResult.rows.length === 0 || findResult.rows[0].deleted_at !== null) {
      throw new AppError(404, 'NOT_FOUND', 'Model not found or already deleted');
    }

    const model = findResult.rows[0];

    // 2. Only owner or admin can delete
    if (model.owner_id !== userId && userRole !== 'admin') {
      throw new AppError(403, 'FORBIDDEN', 'You can only delete your own models');
    }

    // 3. Perform Soft Delete (set deleted_at without removing file from storage)
    const updateResult = await db.query(
      `UPDATE models SET deleted_at = NOW() WHERE id = $1 RETURNING id, owner_id, title, deleted_at`,
      [id]
    );

    res.json({
      message: 'Model soft deleted successfully',
      model: updateResult.rows[0],
    });
  } catch (err) {
    next(err);
  }
});
