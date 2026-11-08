import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './error.middleware';

export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'creator' | 'admin';
  is_seller?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHORIZED', 'Missing or invalid Authorization header');
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, env.jwtSecret) as AuthUser;
    next();
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired JWT token');
  }
}

export function requireSeller(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }
  const isSeller = Boolean(req.user.is_seller || req.user.role === 'creator' || req.user.role === 'admin');
  if (!isSeller) {
    throw new AppError(403, 'FORBIDDEN', 'Seller access required. Please enable seller mode first.');
  }
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }
  if (req.user.role !== 'admin') {
    throw new AppError(403, 'FORBIDDEN', 'Admin access required');
  }
  next();
}
