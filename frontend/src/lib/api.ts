import { buildProfile, creatorHandle, type CreatorProfile } from './creators';
import { PAGE_SIZE, queryModels } from './pagination';
import { MOCK_MODELS } from './mock-models';
import type { Model, ModelsPage, ModelsParams } from './types';

export const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:4000';
export const CDN_SERVICE_URL = process.env.NEXT_PUBLIC_CDN_SERVICE_URL || 'http://localhost:4001';

// Mock data is the default until core-api is ready; set NEXT_PUBLIC_USE_MOCK=false to call it.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

/** List models for the gallery (paged, most popular first). Pages never need to know whether the data is mocked. */
export async function fetchModels(params: ModelsParams): Promise<ModelsPage> {
  if (USE_MOCK) return queryModels(MOCK_MODELS, params);

  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));

  const res = await fetch(`${CORE_API_URL}/api/models?${sp}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load models (${res.status})`);
  const data = (await res.json()) as Partial<ModelsPage>;
  return {
    items: data.items ?? [],
    page: data.page ?? 1,
    pageSize: data.pageSize ?? PAGE_SIZE,
    total: data.total ?? 0,
  };
}

/** One model for its detail page, or `null` when it does not exist. */
export async function fetchModel(id: string): Promise<Model | null> {
  if (USE_MOCK) return MOCK_MODELS.find((m) => m.id === id) ?? null;

  const res = await fetch(`${CORE_API_URL}/api/models/${encodeURIComponent(id)}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load model (${res.status})`);
  return (await res.json()) as Model;
}

/** Other models by the same creator (most popular first), for the "More from" row. */
export async function fetchMoreFromCreator(model: Model, limit = 4): Promise<Model[]> {
  const pool = USE_MOCK ? MOCK_MODELS : (await fetchModels({ page: 1 })).items;
  return queryModels(
    pool.filter((m) => m.creator === model.creator && m.id !== model.id),
    {},
    limit,
  ).items;
}

/** A creator profile by handle (see `creatorHandle`), or `null` when nobody has that handle. */
export async function fetchCreator(handle: string): Promise<CreatorProfile | null> {
  if (USE_MOCK) {
    const mine = MOCK_MODELS.filter((m) => creatorHandle(m.creator) === handle);
    return mine.length > 0 ? buildProfile(mine[0].creator, mine) : null;
  }

  const res = await fetch(`${CORE_API_URL}/api/creators/${encodeURIComponent(handle)}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load creator (${res.status})`);
  return (await res.json()) as CreatorProfile;
}
