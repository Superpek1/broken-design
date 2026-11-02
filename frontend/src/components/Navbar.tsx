'use client';

// Top navigation — logo, Gallery / Docs, search box (UI only, searches nothing yet), Log in
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Search, X } from 'lucide-react';
import { isAuthPath } from '@/lib/auth-paths';

// `desktopOnly` links are hidden below `sm` so the bar fits at 375px.
const LINKS = [
  { href: '/gallery', label: 'Gallery' },
  { href: '/docs', label: 'Docs', desktopOnly: true },
  { href: '/creator', label: 'Creator' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [mobileSearch, setMobileSearch] = useState(false);

  // Search is visual only for now: submitting does nothing.
  const submit = (e: FormEvent) => {
    e.preventDefault();
  };

  if (isAuthPath(pathname)) return null;

  const searchField = (
    <form onSubmit={submit} role="search" className="relative w-full">
      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search 3D models"
        aria-label="Search 3D models"
        className="h-9 w-full rounded-lg border border-white/15 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none"
      />
    </form>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1400px] items-center gap-2 px-4 sm:gap-5 md:px-6">
        <Link href="/" className="whitespace-nowrap text-[15px] font-semibold tracking-wide text-white sm:text-base">
          Lixyte
        </Link>

        <ul className="flex items-center gap-3 text-sm sm:gap-5 sm:text-[15px]">
          {LINKS.map(({ href, label, desktopOnly }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href} className={desktopOnly ? 'hidden sm:block' : undefined}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={active ? 'text-white' : 'text-white/65 transition-colors hover:text-white'}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden w-full max-w-xs md:block">{searchField}</div>

        <div className="ml-auto flex items-center gap-2 text-[15px] sm:gap-3">
          <button
            type="button"
            onClick={() => setMobileSearch((v) => !v)}
            aria-label={mobileSearch ? 'Close search' : 'Open search'}
            aria-expanded={mobileSearch}
            className="grid h-9 w-8 place-items-center rounded-lg text-white/80 hover:text-white md:hidden"
          >
            {mobileSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
          <Link
            href="/login"
            className="whitespace-nowrap rounded-lg bg-white px-3 py-1.5 font-medium sm:px-3.5 text-black transition-colors hover:bg-white/85"
          >
            Log in
          </Link>
        </div>
      </nav>

      {mobileSearch && <div className="border-t border-white/10 px-4 py-3 md:hidden">{searchField}</div>}
    </header>
  );
}
