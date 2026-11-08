// Model detail — preview, description, how to embed it, owner and license rules. Buying and downloading are not connected yet.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Box, Download, Heart } from 'lucide-react';
import ModelCard from '@/components/gallery/ModelCard';
import EmbedSnippets from '@/components/model/EmbedSnippets';
import LicenseRules from '@/components/model/LicenseRules';
import ModelActions from '@/components/model/ModelActions';
import { fetchModel, fetchMoreFromCreator } from '@/lib/api';
import { creatorHandle, initials } from '@/lib/creators';
import { formatCount, formatPrice } from '@/lib/format';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const model = await fetchModel((await params).id);
  return { title: model ? `${model.title} — Lixyte` : 'Model not found — Lixyte' };
}

const CARD = 'rounded-lg border border-white/10 bg-white/5 p-5';
const LABEL = 'font-mono text-[11px] uppercase tracking-[0.16em] text-hud/70';

export default async function ModelDetailPage({ params }: Props) {
  const model = await fetchModel((await params).id);
  if (!model) notFound();

  const more = await fetchMoreFromCreator(model);
  const free = model.priceCents === 0;

  return (
    <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-24 md:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-white/65">
        <Link href="/gallery" className="transition-colors hover:text-white">
          Gallery
        </Link>
        <span aria-hidden className="mx-2 text-white/40">
          /
        </span>
        <span className="text-white">{model.title}</span>
      </nav>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
        {/* Stand-in until the 3D viewer is wired to the CDN. */}
        <div
          aria-hidden
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] text-white/40"
        >
          <Box className="h-8 w-8" />
          <span className="text-sm">3D preview</span>
        </div>

        <aside className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-3 lg:row-start-1">
          <div className={`${CARD} space-y-5`}>
            <div>
              <h1 className="font-display text-[clamp(20px,2.4vw,28px)] uppercase leading-[1.1] text-white">
                {model.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
                    free ? 'border-hud/40 text-hud' : 'border-white/25 text-white'
                  }`}
                >
                  {free ? 'Free' : formatPrice(model.priceCents)}
                </span>
                <span className="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/65">
                  {model.license}
                </span>
              </div>
            </div>

            <ModelActions free={free} priceLabel={formatPrice(model.priceCents)} />

            <div className="flex items-center gap-3 border-t border-white/10 pt-5">
              <span
                aria-hidden
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-hud/30 font-mono text-sm text-hud"
              >
                {initials(model.creator)}
              </span>
              <div className="min-w-0">
                <Link
                  href={`/creators/${creatorHandle(model.creator)}`}
                  className="block truncate text-sm font-medium text-white transition-colors hover:text-hud"
                >
                  {model.creator}
                </Link>
                <p className="text-sm text-white/65">Owner</p>
              </div>
            </div>

            <dl className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5 font-mono text-[12px] text-white/65">
              <div className="flex items-center gap-1.5">
                <Heart aria-hidden className="h-4 w-4" />
                <dt className="sr-only">Likes</dt>
                <dd>{formatCount(model.likeCount)}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <Download aria-hidden className="h-4 w-4" />
                <dt className="sr-only">Downloads</dt>
                <dd>{formatCount(model.downloadCount)}</dd>
              </div>
              <div>
                <dt className="sr-only">Format</dt>
                <dd>.glb · glTF 2.0</dd>
              </div>
            </dl>

            <div className="border-t border-white/10 pt-5">
              <LicenseRules license={model.license} />
            </div>
          </div>
        </aside>

        <section aria-labelledby="description" className={CARD}>
          <h2 id="description" className={LABEL}>
            [ Description ]
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/80">{model.description ?? 'No description yet.'}</p>
          {model.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {model.tags.map((t) => (
                <li key={t} className="rounded border border-white/15 px-2 py-0.5 font-mono text-[11px] text-white/65">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="how-to-use" className={CARD}>
          <h2 id="how-to-use" className={LABEL}>
            [ How to use ]
          </h2>
          <div className="mt-3">
            <EmbedSnippets id={model.id} paid={!free} />
          </div>
        </section>
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more-from" className="mt-16">
          <h2 id="more-from" className="font-display text-[clamp(18px,2.2vw,24px)] uppercase leading-snug text-white">
            More from{' '}
            <Link href={`/creators/${creatorHandle(model.creator)}`} className="transition-colors hover:text-hud">
              {model.creator}
            </Link>
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {more.map((m) => (
              <li key={m.id}>
                <ModelCard model={m} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
