
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './error.middleware';

type UserRole = 'user' | 'creator' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'creator';
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

