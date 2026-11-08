import fsp from 'fs/promises';
import { Readable } from 'stream';
import { StorageAdapter, ByteRange } from './storage.interface';
import { supabase } from '../config/supabase';
import { env } from '../config/env';

export class SupabaseStorage implements StorageAdapter {
  private bucket = env.supabaseStorageBucket;

  async put(hashKey: string, tempFilePath: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client is not configured');
    }
    const fileBuffer = await fsp.readFile(tempFilePath);
    const contentType = hashKey.endsWith('.glb')
      ? 'model/gltf-binary'
      : hashKey.endsWith('.webp')
      ? 'image/webp'
      : 'application/octet-stream';

    const { error } = await supabase.storage.from(this.bucket).upload(hashKey, fileBuffer, {
      upsert: true,
      contentType,
    });
    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }
    await fsp.unlink(tempFilePath).catch(() => undefined);
  }

  async getStream(hashKey: string, range?: ByteRange): Promise<{ stream: Readable; size: number }> {
    if (!supabase) {
      throw new Error('Supabase client is not configured');
    }
    const { data, error } = await supabase.storage.from(this.bucket).download(hashKey);
    if (error || !data) {
      throw new Error(`Supabase Storage download failed: ${error?.message || 'File not found'}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const totalSize = buffer.length;

    let targetBuffer = buffer;
    if (range) {
      const start = Math.max(0, range.start);
      const end = Math.min(totalSize - 1, range.end);
      targetBuffer = buffer.subarray(start, end + 1);
    }

    const stream = Readable.from(targetBuffer);
    return { stream, size: totalSize };
  }

  async delete(hashKey: string): Promise<void> {
    if (!supabase) return;
    await supabase.storage.from(this.bucket).remove([hashKey]);
  }
}

