'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

export default function FaqAccordion({ faqs = [] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-ink-100 overflow-hidden rounded-2xl bg-white shadow-soft">
      {faqs.map((f, i) => (
        <div key={f.q}>
          <button onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
            <span className="text-[15px] font-semibold">{f.q}</span>
            {open === i ? <Minus size={17} className="shrink-0 text-gold-500" /> : <Plus size={17} className="shrink-0 text-ink-400" />}
          </button>
          {open === i && <p className="px-5 pb-5 text-sm leading-relaxed text-ink-500">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}
