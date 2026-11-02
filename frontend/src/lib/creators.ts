// Creator profile helpers. Until core-api has creator accounts, a creator is just the name on a model.
import type { Model } from './types';

export interface CreatorProfile {
  handle: string;
  name: string;
  bio: string;
  models: Model[];
  totalDownloads: number;
  totalLikes: number;
}

/** "Tomás Vega" -> "tomas-vega" (URL-safe, accents dropped). */
export function creatorHandle(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Build a profile from a creator's models (most popular first). */
export function buildProfile(name: string, models: Model[]): CreatorProfile {
  const sorted = [...models].sort((a, b) => b.likeCount - a.likeCount || b.downloadCount - a.downloadCount);
  return {
    handle: creatorHandle(name),
    name,
    bio: 'Sample bio until creators can write their own.',
    models: sorted,
    totalDownloads: sorted.reduce((n, m) => n + m.downloadCount, 0),
    totalLikes: sorted.reduce((n, m) => n + m.likeCount, 0),
  };
}
