// Creator profile header: cover, photo, name, bio and stats. Read-only; the cover and photo are placeholders until
// creators can upload their own.
import { initials } from '@/lib/creators';
import { formatCount } from '@/lib/format';

interface Props {
  name: string;
  handle: string;
  bio: string;
  modelCount: number;
  downloads: number;
  likes: number;
}

export default function ProfileHeader({ name, handle, bio, modelCount, downloads, likes }: Props) {
  return (
    <header>
      <div className="relative h-32 overflow-hidden rounded-lg border border-white/10 bg-black sm:h-44">
        <svg aria-hidden viewBox="0 0 680 120" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="cover-holo" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#8fd3ff" />
              <stop offset="0.4" stopColor="#b892ff" />
              <stop offset="0.7" stopColor="#ff9ec7" />
              <stop offset="1" stopColor="#ffb070" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#cover-holo)" vectorEffect="non-scaling-stroke">
            <path d="M0 80 C120 92 200 28 330 48 S560 94 680 40" strokeOpacity="0.8" vectorEffect="non-scaling-stroke" />
            <path d="M0 98 C140 106 220 54 340 72 S570 110 680 64" strokeOpacity="0.4" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
      </div>

      <div className="flex flex-wrap items-end gap-x-4 gap-y-3 px-1 sm:px-4">
        <div className="-mt-10 shrink-0 sm:-mt-12">
          <div className="grid h-20 w-20 place-items-center rounded-full border border-hud/50 bg-black sm:h-24 sm:w-24">
            <span aria-hidden className="font-mono text-2xl text-hud">
              {initials(name)}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 pt-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-hud/70">[ Creator ]</p>
          <h1 className="mt-1 font-display text-[clamp(22px,3vw,32px)] uppercase leading-[1.05] text-white">{name}</h1>
          <p className="mt-1 text-sm text-white/65">@{handle}</p>
        </div>
      </div>

      <p className="mt-4 max-w-[60ch] px-1 text-[15px] leading-relaxed text-white/80 sm:px-4">{bio}</p>
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 px-1 font-mono text-[12px] text-white/65 sm:px-4">
        <div className="flex gap-1.5">
          <dd className="text-white">{formatCount(modelCount)}</dd>
          <dt>{modelCount === 1 ? 'model' : 'models'}</dt>
        </div>
        <div className="flex gap-1.5">
          <dd className="text-white">{formatCount(downloads)}</dd>
          <dt>downloads</dt>
        </div>
        <div className="flex gap-1.5">
          <dd className="text-white">{formatCount(likes)}</dd>
          <dt>likes</dt>
        </div>
      </dl>
    </header>
  );
}
