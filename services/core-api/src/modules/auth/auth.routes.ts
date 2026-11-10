
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../../config/db';
import { env } from '../../config/env';
import { AppError } from '../../middlewares/error.middleware';

export const authRouter = Router();

// [Member 1] POST /api/auth/register
// authRouter.post('/register', async (_req, res) => {
//   res.status(201).json({ message: 'TODO [Member 1]: Register user with bcrypt & return JWT' });
// });

// [Member 1] POST /api/auth/login
// authRouter.post('/login', async (_req, res) => {
//   res.json({ message: 'TODO [Member 1]: Verify credentials & issue JWT' });
// });

const registerSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  displayName: z.string().trim().min(1).max(100),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1),
});

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(400, 'INVALID_INPUT', 'Invalid registration information');
  }

  const { email, password, displayName } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  // Hash password before saving it.
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await db.query(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, display_name, role, is_seller`,
      [normalizedEmail, passwordHash, displayName],
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      env.jwtSecret,
      { expiresIn: '1d' },
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user,
    });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      throw new AppError(409, 'EMAIL_EXISTS', 'This email is already registered');
    }

    throw error;
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(400, 'INVALID_INPUT', 'Invalid login information');
  }

  const { email, password } = parsed.data;

  const result = await db.query(
    `SELECT id, email, password_hash, display_name, role, is_seller, suspended_at
     FROM users
     WHERE email = $1`,
    [email.toLowerCase()],
  );

  const user = result.rows[0];

  // Use the same response for unknown email and wrong password.
  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  }

  if (user.suspended_at) {
    throw new AppError(403, 'ACCOUNT_SUSPENDED', 'This account has been suspended');
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: '1d' },
  );

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      role: user.role,
      is_seller: user.is_seller,
    },
  });
});
