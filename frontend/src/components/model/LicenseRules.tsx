// License summary with a short do / don't list
import { Check, X } from 'lucide-react';
import { LICENSE_INFO } from '@/lib/licenses';
import type { License } from '@/lib/types';

export default function LicenseRules({ license }: { license: License }) {
  const info = LICENSE_INFO[license];
  return (
    <div>
      <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-hud/70">[ License ]</h2>
      <p className="mt-2 text-sm font-medium text-white">{info.name}</p>
      <p className="mt-1 text-sm text-white/65">{info.summary}</p>
      <ul className="mt-3 space-y-1.5">
        {info.rules.map((r) => (
          <li key={r.text} className="flex items-start gap-2 text-sm text-white/80">
            {r.ok ? (
              <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
            ) : (
              <X aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
            )}
            <span>
              <span className="sr-only">{r.ok ? 'Allowed: ' : 'Not allowed: '}</span>
              {r.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
