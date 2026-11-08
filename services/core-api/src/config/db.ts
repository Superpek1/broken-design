import { Pool } from 'pg';
import { env } from './env';

// Determine if connection requires SSL (e.g. Supabase, Render, or sslmode=require)
const isCloudPostgres =
  Boolean(env.databaseUrl) &&
  (env.databaseUrl.includes('supabase.co') ||
    env.databaseUrl.includes('pooler.supabase.com') ||
    env.databaseUrl.includes('sslmode=require') ||
    env.databaseUrl.includes('render.com'));

export const db = new Pool({
  connectionString: env.databaseUrl,
  ssl: isCloudPostgres ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Prevent unhandled errors on idle clients from crashing the server process
db.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]: Unexpected error on idle client:', err.message);
});

/**
 * ทดสอบการเชื่อมต่อฐานข้อมูล (Health Check & Diagnostics)
 */
export async function testDbConnection(): Promise<{ ok: boolean; message: string }> {
  if (!env.databaseUrl) {
    return { ok: false, message: 'DATABASE_URL is not configured in .env' };
  }

  try {
    const client = await db.connect();
    try {
      await client.query('SELECT 1');
      return { ok: true, message: 'Database connection successful' };
    } finally {
      client.release();
    }
  } catch (err: any) {
    const errorMsg = err?.message || 'Unknown database connection error';
    return { ok: false, message: `Database connection failed: ${errorMsg}` };
  }
}
