// Creator landing — what you can do as a creator, with an interactive 3D model preview and a Get started button.
// Content only: nothing here calls an API (auth and upload are not connected yet).
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CodeXml, Coins, LayoutDashboard, Scale, Upload, Zap, type LucideIcon } from 'lucide-react';
import SectionHeading from '@/components/landing/SectionHeading';
import CreatorModel from '@/components/creator/CreatorModel';

export const metadata: Metadata = { title: 'Creators — Lixyte' };

const HUD_CLIP = 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))';

const FEATURES: { icon: LucideIcon; title: string; body: React.ReactNode }[] = [
  {
    icon: Upload,
    title: 'Upload a .glb',
    body: 'Drop in a glTF 2.0 binary up to 50 MB. We check it on upload, so broken files never reach the gallery.',
  },
  {
    icon: Coins,
    title: 'Free or paid',
    body: 'Give a model away or set a price. Buyers get their own embed key for it.',
  },
  {
    icon: Scale,
    title: 'Pick a license',
    body: 'CC0, CC-BY, CC-BY-NC or Commercial, shown clearly on every model page.',
  },
  {
    icon: CodeXml,
    title: 'Embed anywhere',
    body: <>One iframe or one {'<vm-model>'} tag puts your model on any website, with no hosting on their side.</>,
  },
  {
    icon: Zap,
    title: 'Fast delivery',
    body: 'Models come from a cached CDN with range requests, so they start streaming before they finish loading.',
  },
  {
    icon: LayoutDashboard,
    title: 'Manage your work',
    body: 'Edit titles, tags and prices, and retire models, all from one dashboard.',
  },
];

const STEPS = [
  { n: '01', title: 'Log in', body: 'Sign in with your email or Google. New here? The same form creates your account.' },
  { n: '02', title: 'Upload', body: 'Add your .glb with a title, tags, a license and a price.' },
  { n: '03', title: 'Share', body: 'Copy the embed code and paste it on your site. That is it.' },
];

const GET_STARTED =
  'inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-1.5 text-[15px] font-medium text-black transition-colors hover:bg-white/85';

export default function CreatorPage() {
  return (
    <main className="overflow-x-clip">
      <section className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-4 pb-16 pt-24 md:px-6 lg:min-h-[calc(100dvh-2rem)] lg:grid-cols-[1.05fr_1fr]">
        {/* two flowing waves across the full width, filled with a soft pink that fades downward, under the butterfly */}
        <svg
          aria-hidden
          viewBox="0 0 1240 400"
          preserveAspectRatio="none"
          className="pointer-events-none absolute bottom-[4%] left-1/2 z-[1] h-[50%] w-screen -translate-x-1/2"
        >
          <defs>
            <linearGradient id="wave-holo" gradientUnits="userSpaceOnUse" x1="0" x2="1240" y1="0" y2="0">
              <stop offset="0" stopColor="#8fd3ff" />
              <stop offset="0.35" stopColor="#b892ff" />
              <stop offset="0.65" stopColor="#ff9ec7" />
              <stop offset="1" stopColor="#ffb070" />
            </linearGradient>
            <linearGradient id="wave-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="white" stopOpacity="0.3" />
              <stop offset="0.55" stopColor="white" stopOpacity="0.08" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id="wave-fill-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1240" height="400">
              <rect width="1240" height="400" fill="url(#wave-fill)" />
            </mask>
            <linearGradient id="wave-edge" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="white" stopOpacity="0" />
              <stop offset="0.15" stopColor="white" stopOpacity="1" />
              <stop offset="0.85" stopColor="white" stopOpacity="1" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id="wave-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1240" height="400">
              <rect width="1240" height="400" fill="url(#wave-edge)" />
            </mask>
            <filter id="wave-glow" x="-5%" y="-30%" width="110%" height="160%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          <g mask="url(#wave-mask)">
            <g mask="url(#wave-fill-mask)" fill="url(#wave-holo)">
              <path d="M0 200 C120 215 170 335 300 335 S500 250 620 130 S760 55 840 70 S1100 160 1240 215 V400 H0 Z" />
              <path fillOpacity="0.6" d="M0 300 C100 300 200 340 330 300 S400 320 440 320 S600 220 700 120 S820 85 880 90 S1100 170 1240 210 V400 H0 Z" />
            </g>
            <g fill="none" stroke="url(#wave-holo)">
              <path filter="url(#wave-glow)" strokeWidth="3" strokeOpacity="0.5" vectorEffect="non-scaling-stroke" d="M0 200 C120 215 170 335 300 335 S500 250 620 130 S760 55 840 70 S1100 160 1240 215" />
              <path strokeWidth="1.2" strokeOpacity="0.8" vectorEffect="non-scaling-stroke" d="M0 200 C120 215 170 335 300 335 S500 250 620 130 S760 55 840 70 S1100 160 1240 215" />
              <path strokeWidth="1" strokeOpacity="0.4" vectorEffect="non-scaling-stroke" d="M0 300 C100 300 200 340 330 300 S400 320 440 320 S600 220 700 120 S820 85 880 90 S1100 170 1240 210" />
            </g>
          </g>
        </svg>
        <div className="relative z-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-hud/70">[ For creators ]</p>
          <h1 className="mt-4 font-display text-[clamp(28px,4vw,56px)] uppercase leading-[1.05] text-white">
            Publish your 3D{' '}
            <span className="bg-gradient-to-r from-hud via-violet to-amber bg-clip-text text-transparent">
              Reach every site
            </span>
          </h1>
          <p className="mt-5 max-w-[50ch] text-[15px] leading-relaxed text-white/65">
            Upload a model once and anyone can put it on their website with a single line of code. You choose the
            license and the price; we handle storage and fast delivery.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/login" className={GET_STARTED}>
              Get started
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="border border-white px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-black"
            >
              See how it works
            </a>
          </div>
          <pre className="mt-8 max-w-full overflow-x-auto rounded-lg border border-white/10 bg-[#0d0d0d] px-4 py-3 font-mono text-[12.5px] text-white/65">
            <code>{'<vm-model model-id="your-model"></vm-model>'}</code>
          </pre>
        </div>

        <CreatorModel />
      </section>

      <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)] gap-20 px-4 pb-20 md:px-6">
        <section aria-label="What you can do">
          <SectionHeading label="Creators" title="What you can do" />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="rounded-lg border border-white/10 bg-white/5 p-5">
                <span className="grid h-10 w-10 place-items-center rounded-lg border border-hud/30 text-hud">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[15px] font-medium text-white">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/65">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="how-it-works" aria-label="How it works" className="scroll-mt-24">
          <SectionHeading label="Three steps" title="How it works" />
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map(({ n, title, body }) => (
              <li key={n} className="rounded-lg border border-white/10 bg-white/5 p-5">
                <span className="font-mono text-[11px] tracking-[0.16em] text-hud/70">{n}</span>
                <h3 className="mt-3 font-display text-base uppercase leading-snug text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* <section
          aria-label="Become a creator"
          className="border border-hud/40 bg-[rgba(4,8,18,0.66)] p-6 backdrop-blur-sm md:p-10"
          style={{ clipPath: HUD_CLIP }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-hud/70">[ Join ]</p>
              <h2 className="mt-3 font-display text-[clamp(20px,2.6vw,30px)] uppercase leading-snug text-white">
                Ready to publish?
              </h2>
              <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-white/65">
                Create a free account and upload your first model in minutes.
              </p>
            </div>
            <Link href="/login" className={`${GET_STARTED} shrink-0 self-start md:self-auto`}>
              Get started
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </section> */}
      </div>
    </main>
  );
}
