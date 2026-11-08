// Gallery — paged grid of 3D models. The page number lives in the URL (?page=). Search and filters are UI only.
import type { Metadata } from 'next';
import FilterBar from '@/components/gallery/FilterBar';
import ModelCard from '@/components/gallery/ModelCard';
import Pagination from '@/components/gallery/Pagination';
import { fetchModels } from '@/lib/api';
import { parseParams } from '@/lib/pagination';

export const metadata: Metadata = { title: 'Gallery — Lixyte' };

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const data = await fetchModels(parseParams(await searchParams));

  return (
    <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-24 md:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-hud/70">[ 3D asset library ]</p>
      <h1 className="mt-4 font-display text-[clamp(28px,4vw,48px)] uppercase leading-[1.02] text-white">Gallery</h1>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <p className="text-sm text-white/65">
          {data.total} {data.total === 1 ? 'model' : 'models'}
        </p>
        <FilterBar />
      </div>

      {data.items.length > 0 ? (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.items.map((m) => (
            <li key={m.id}>
              <ModelCard model={m} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-white">No models yet.</p>
        </div>
      )}

      <Pagination data={data} />
    </main>
  );
}
