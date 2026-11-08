'use client';

// Donate box. Payments are not connected yet, so the button only validates the amount and shows a status line.
import { useId, useState } from 'react';
import { AlertCircle } from 'lucide-react';

const PRESETS = [3, 5, 10];
const MIN = 1;
const MAX = 500;

export default function DonateCard({ creator }: { creator: string }) {
  const [preset, setPreset] = useState<number | 'custom'>(5);
  const [custom, setCustom] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(false);
  const customId = useId();
  const messageId = useId();

  const amount = preset === 'custom' ? Number.parseInt(custom, 10) : preset;
  const valid = Number.isInteger(amount) && amount >= MIN && amount <= MAX;

  const submit = () => {
    if (!valid) {
      setNotice(false);
      setError(`Enter a whole amount from $${MIN} to $${MAX}.`);
      return;
    }
    setError('');
    setNotice(true);
  };

  const chip = (active: boolean) =>
    `rounded-lg border px-2 py-2 text-center text-sm transition-colors ${
      active ? 'border-white/60 text-white' : 'border-white/15 text-white/65 hover:text-white'
    }`;

  return (
    <section aria-labelledby="donate-title" className="rounded-lg border border-white/10 bg-white/5 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-hud/70">[ Support ]</p>
      <h2 id="donate-title" className="mt-2 font-display text-lg uppercase leading-snug text-white">
        Donate
      </h2>
      <p className="mt-1 text-sm text-white/65">Say thanks to {creator} for their work.</p>

      <div role="group" aria-label="Amount" className="mt-4 grid grid-cols-4 gap-2">
        {PRESETS.map((p) => (
          <button key={p} type="button" aria-pressed={preset === p} onClick={() => setPreset(p)} className={chip(preset === p)}>
            ${p}
          </button>
        ))}
        <button type="button" aria-pressed={preset === 'custom'} onClick={() => setPreset('custom')} className={chip(preset === 'custom')}>
          Other
        </button>
      </div>

      {preset === 'custom' && (
        <div className="mt-3">
          <label htmlFor={customId} className="text-sm text-white/65">
            Amount (USD)
          </label>
          <input
            id={customId}
            inputMode="numeric"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value.replace(/\D/g, '').slice(0, 3));
              setError('');
              setNotice(false);
            }}
            aria-invalid={!!error}
            className="mt-1 h-10 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none"
            placeholder="25"
          />
        </div>
      )}

      <div className="mt-3">
        <label htmlFor={messageId} className="text-sm text-white/65">
          Message (optional)
        </label>
        <textarea
          id={messageId}
          value={message}
          maxLength={200}
          rows={3}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none"
          placeholder="Say something nice"
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 flex items-center gap-1.5 text-sm text-red-300">
          <AlertCircle aria-hidden className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        className="mt-4 h-10 w-full rounded-lg bg-white px-3.5 text-[15px] font-medium text-black transition-colors hover:bg-white/85"
      >
        {valid ? `Donate $${amount}` : 'Donate'}
      </button>
      {notice && (
        <p role="status" className="mt-2 text-sm text-amber">
          Donations are not connected yet.
        </p>
      )}
      <p className="mt-4 text-sm text-white/40">No donations yet. Be the first.</p>
    </section>
  );
}
