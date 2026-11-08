import fs from 'fs';
import fsp from 'fs/promises';
import crypto from 'crypto';

/**
 * ตรวจ Magic Bytes ของไฟล์ .glb:
 * - Bytes 0..3: 'glTF' (0x46546c67 little-endian)
 * - Bytes 4..7: version === 2
 * - Bytes 8..11: total byte length === actualSize
 */
export function validateGlbHeader(headerBuffer: Buffer, actualSize: number): boolean {
  if (headerBuffer.length < 12) return false;
  const magic = headerBuffer.readUInt32LE(0);
  const version = headerBuffer.readUInt32LE(4);
  const declaredLength = headerBuffer.readUInt32LE(8);
  return magic === 0x46546c67 && version === 2 && declaredLength === actualSize;
}

/**
 * ตรวจสอบไฟล์ .glb จาก filePath ว่ามี header ถูกต้องตามสเปก glTF 2.0 Binary หรือไม่
 */
export async function validateGlbFile(filePath: string): Promise<{ valid: boolean; size: number; reason?: string }> {
  try {
    const stat = await fsp.stat(filePath);
    if (stat.size < 12) {
      return { valid: false, size: stat.size, reason: 'File size too small to be a valid GLB' };
    }

    const fd = await fsp.open(filePath, 'r');
    const headerBuffer = Buffer.alloc(12);
    await fd.read(headerBuffer, 0, 12, 0);
    await fd.close();

    const isValid = validateGlbHeader(headerBuffer, stat.size);
    if (!isValid) {
      return { valid: false, size: stat.size, reason: 'Invalid GLB magic bytes, version, or declared length mismatch' };
    }

    return { valid: true, size: stat.size };
  } catch (err: any) {
    return { valid: false, size: 0, reason: err?.message || 'Failed to inspect file' };
  }
}

/**
 * คำนวณ Content Hash (SHA-256) ของไฟล์ เพื่อใช้เป็นลายนิ้วมือในการตั้งชื่อไฟล์ (Content-Addressable)
 */
export function computeFileSha256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
}
