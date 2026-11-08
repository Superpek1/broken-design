// Shared frontend types for model listings (mirrors the core-api `GET /api/models` contract)

export const LICENSES = ['CC0', 'CC-BY', 'CC-BY-NC', 'COMMERCIAL'] as const;
export type License = (typeof LICENSES)[number];

export const GALLERY_TAGS = ['character', 'vehicle', 'architecture', 'nature', 'sci-fi', 'props', 'abstract', 'animal'] as const;

export interface Model {
  id: string;
  title: string;
  creator: string;
  tags: string[];
  license: License;
  priceCents: number;
  likeCount: number;
  downloadCount: number;
  posterUrl?: string;
  description?: string;
}

// Search/filter params are not supported (the gallery filter UI is visual only); only paging.
export interface ModelsParams {
  page?: number;
}

export interface ModelsPage {
  items: Model[];
  page: number;
  pageSize: number;
  total: number;
}
