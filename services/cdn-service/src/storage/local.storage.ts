import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { StorageAdapter, ByteRange } from './storage.interface';
import { env } from '../config/env';

export class LocalDiskStorage implements StorageAdapter {
  private baseDir = path.resolve(env.storageDir);

  private resolveSafePath(hashKey: string): string {
    const cleanKey = path.basename(hashKey);
    return path.join(this.baseDir, cleanKey);
  }

  async put(hashKey: string, tempFilePath: string): Promise<void> {
    await fsp.mkdir(this.baseDir, { recursive: true });
    const targetPath = this.resolveSafePath(hashKey);
    try {
      await fsp.rename(tempFilePath, targetPath);
    } catch (err: any) {
      if (err?.code === 'EXDEV') {
        await fsp.copyFile(tempFilePath, targetPath);
        await fsp.unlink(tempFilePath).catch(() => undefined);
      } else {
        throw err;
      }
    }
  }

  async getStream(hashKey: string, range?: ByteRange) {
    const targetPath = this.resolveSafePath(hashKey);
    const stat = await fsp.stat(targetPath);
    const stream = fs.createReadStream(targetPath, range ? { start: range.start, end: range.end } : undefined);
    return { stream, size: stat.size };
  }

  async delete(hashKey: string): Promise<void> {
    const targetPath = this.resolveSafePath(hashKey);
    await fsp.unlink(targetPath).catch(() => undefined);
  }
}
