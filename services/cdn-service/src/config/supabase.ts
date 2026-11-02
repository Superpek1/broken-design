import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// [Member 2] Supabase Client สำหรับเชื่อมต่อ Supabase Storage (เมื่อ STORAGE_PROVIDER=supabase)
export const supabase =
  env.supabaseUrl && env.supabaseKey
    ? createClient(env.supabaseUrl, env.supabaseKey)
    : null;

