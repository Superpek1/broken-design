// Mock catalogue used until core-api `GET /api/models` is implemented (see `fetchModels` in api.ts)
import type { License, Model } from './types';

type Row = [title: string, creator: string, tags: string[], license: License, priceCents: number, likes: number, downloads: number];

const ROWS: Row[] = [
  ['Spectral Lily', 'Mira Okafor', ['nature', 'abstract'], 'CC-BY', 0, 482, 3120],
  ['Hover Bike MK2', 'Jun Park', ['vehicle', 'sci-fi'], 'COMMERCIAL', 1500, 391, 1204],
  ['Low-poly Oak', 'Elena Rossi', ['nature', 'props'], 'CC0', 0, 355, 5230],
  ['Cyber Samurai', 'Kenji Mori', ['character', 'sci-fi'], 'COMMERCIAL', 2900, 342, 988],
  ['Glass Fox', 'Mira Okafor', ['animal', 'abstract'], 'CC-BY', 0, 318, 2760],
  ['Orbital Habitat', 'Noor Haddad', ['architecture', 'sci-fi'], 'COMMERCIAL', 4500, 297, 640],
  ['Mossy Stone Arch', 'Elena Rossi', ['architecture', 'nature'], 'CC0', 0, 276, 4410],
  ['Desk Lamp', 'Tomás Vega', ['props'], 'CC-BY-NC', 0, 251, 1980],
  ['Neon Koi', 'Jun Park', ['animal', 'abstract'], 'CC-BY', 800, 233, 870],
  ['Rover Scout', 'Noor Haddad', ['vehicle', 'sci-fi'], 'CC0', 0, 214, 3305],
  ['Paper Crane', 'Aiko Tanaka', ['animal', 'props'], 'CC0', 0, 198, 2150],
  ['Brutalist Tower', 'Tomás Vega', ['architecture'], 'COMMERCIAL', 3200, 187, 512],
  ['Android Head', 'Kenji Mori', ['character', 'sci-fi'], 'CC-BY-NC', 0, 176, 1430],
  ['Crystal Cluster', 'Aiko Tanaka', ['nature', 'abstract'], 'CC0', 0, 165, 2890],
  ['Vintage Scooter', 'Lena Fischer', ['vehicle', 'props'], 'COMMERCIAL', 1200, 154, 701],
  ['Forest Spirit', 'Mira Okafor', ['character', 'nature'], 'CC-BY', 1800, 143, 455],
  ['Floating Island', 'Elena Rossi', ['nature', 'architecture'], 'CC-BY', 0, 132, 1960],
  ['Retro Radio', 'Lena Fischer', ['props'], 'CC0', 0, 121, 2670],
  ['Plasma Drone', 'Jun Park', ['vehicle', 'sci-fi'], 'COMMERCIAL', 2200, 109, 388],
  ['Lowpoly Wolf', 'Aiko Tanaka', ['animal'], 'CC-BY-NC', 0, 98, 1740],
  ['Marble Bust', 'Tomás Vega', ['props', 'character'], 'CC0', 0, 87, 3010],
  ['Tide Pool', 'Noor Haddad', ['nature', 'abstract'], 'CC-BY', 600, 74, 322],
  ['Mech Arm', 'Kenji Mori', ['character', 'props', 'sci-fi'], 'COMMERCIAL', 3900, 66, 241],
  ['Glitch Cube', 'Lena Fischer', ['abstract'], 'CC0', 0, 52, 1180],
];

// Enough rows for two pages of 48: the base rows repeated as numbered variants with fewer likes.
const VARIANTS = ['', ' II', ' III', ' IV'];

export const MOCK_MODELS: Model[] = VARIANTS.flatMap((suffix, v) =>
  ROWS.map(([title, creator, tags, license, priceCents, likeCount, downloadCount], i) => ({
    id: `mock-${String(v * ROWS.length + i + 1).padStart(2, '0')}`,
    title: title + suffix,
    creator,
    description: `${title + suffix} is a ${tags.join(' / ')} model by ${creator}, ready to drop into a scene or embed on a site. Sample text until real descriptions come from the API.`,
    tags,
    license,
    priceCents,
    likeCount: Math.round(likeCount * (1 - v * 0.2)),
    downloadCount: Math.round(downloadCount * (1 - v * 0.2)),
  })),
);
