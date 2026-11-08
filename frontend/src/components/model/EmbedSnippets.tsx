'use client';

// "How to use": copy-ready embed code (web component or iframe) with a short numbered guide.
import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';

type Kind = 'component' | 'iframe';

const TABS: { id: Kind; label: string }[] = [
  { id: 'component', label: '<vm-model>' },
  { id: 'iframe', label: 'iframe' },
];

export default function EmbedSnippets({ id, paid }: { id: string; paid: boolean }) {
  const [kind, setKind] = useState<Kind>('component');
  const [copied, setCopied] = useState(false);
  // The origin is only known in the browser; until then the code shows a relative path.
  const [origin, setOrigin] = useState('');
  useEffect(() => setOrigin(window.location.origin), []);

  const key = paid ? ' key="YOUR_EMBED_KEY"' : '';
  const code =
    kind === 'component'
      ? `<script src="${origin}/embed.js"></script>\n<vm-model model-id="${id}"${key}></vm-model>`
      : `<iframe\n  src="${origin}/embed/${id}${paid ? '?key=YOUR_EMBED_KEY' : ''}"\n  width="600"\n  height="400"\n  loading="lazy"\n></iframe>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const steps = paid
    ? ['Buy the model to get your embed key.', 'Copy the code and put your key in place of YOUR_EMBED_KEY.', 'Paste it into your page. The model streams from our CDN.']
    : ['Copy the code below.', 'Paste it into your page.', 'That is it. The model streams from our CDN, with nothing to host.'];

  return (
    <div>
      <ol className="space-y-2 text-sm text-white/65">
        {steps.map((s, i) => (
          <li key={s} className="flex gap-3">
            <span className="font-mono text-[11px] leading-5 tracking-[0.16em] text-hud/70">0{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div role="tablist" aria-label="Embed type" className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={kind === t.id}
              onClick={() => setKind(t.id)}
              className={`rounded border px-2 py-1 font-mono text-[11px] transition-colors ${
                kind === t.id ? 'border-white/50 text-white' : 'border-white/15 text-white/65 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-white/65 transition-colors hover:text-white"
        >
          {copied ? <Check aria-hidden className="h-4 w-4 text-hud" /> : <Copy aria-hidden className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="mt-2 max-w-full overflow-x-auto rounded-lg border border-white/10 bg-black px-4 py-3 font-mono text-[12.5px] leading-relaxed text-white/80">
        <code>{code}</code>
      </pre>
    </div>
  );
}
