import { StorageAdapter } from './storage.interface';
import { LocalDiskStorage } from './local.storage';
import { SupabaseStorage } from './supabase.storage';
import { env } from '../config/env';
import { supabase } from '../config/supabase';

let storageInstance: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (!storageInstance) {
    if (env.storageProvider === 'supabase' && supabase) {
      storageInstance = new SupabaseStorage();
    } else {
      storageInstance = new LocalDiskStorage();
    }
  }
  return storageInstance;
}

export * from './storage.interface';
export * from './local.storage';
export * from './supabase.storage';

