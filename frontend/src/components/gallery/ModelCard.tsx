// Gallery card — lazy poster, title, creator, Free/price badge, likes
import Link from 'next/link';
import { Heart, Image as ImageIcon } from 'lucide-react';
import { formatPrice as price } from '@/lib/format';
import type { Model } from '@/lib/types';

export default function ModelCard({ model }: { model: Model }) {
  const free = model.priceCents === 0;
  return (
    <Link
      href={`/models/${model.id}`}
      className="group block overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-colors hover:border-white/30"
    >
      {model.posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={model.posterUrl} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
      ) : (
        // Stand-in until real poster images exist.
        <div
          aria-hidden
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-white/[0.06] text-white/40"
        >
          <ImageIcon className="h-7 w-7" />
          <span className="text-sm">Image</span>
        </div>
      )}
      <div className="p-3">
        <h3 className="truncate text-sm font-medium text-white">{model.title}</h3>
        <p className="mt-0.5 truncate text-sm text-white/65">{model.creator}</p>
        <div className="mt-3 flex items-center justify-between">
          <span
            className={
              free
                ? 'rounded border border-hud/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-hud'
                : 'rounded border border-white/25 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white'
            }
          >
            {free ? 'Free' : price(model.priceCents)}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-white/65">
            <Heart aria-hidden className="h-4 w-4" />
            <span className="sr-only">Likes:</span>
            {model.likeCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
