'use client';

// The one primary button on the model page. Buying and downloading are not connected yet, so it only shows a status line.
import { useState } from 'react';

export default function ModelActions({ free, priceLabel }: { free: boolean; priceLabel: string }) {
  const [notice, setNotice] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setNotice(true)}
        className="h-10 w-full rounded-lg bg-white px-3.5 text-[15px] font-medium text-black transition-colors hover:bg-white/85"
      >
        {free ? 'Get this model' : `Buy for ${priceLabel}`}
      </button>
      {notice && (
        <p role="status" className="mt-2 text-sm text-amber">
          {free ? 'Downloads are not connected yet.' : 'Checkout is not connected yet.'}
        </p>
      )}
    </div>
  );
}
