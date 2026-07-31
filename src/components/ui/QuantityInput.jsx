'use client';

import { Minus, Plus } from 'lucide-react';

export default function QuantityInput({ value, onChange, max = 99, size = 'md' }) {
  const pad = size === 'sm' ? 'h-8 w-8' : 'h-11 w-11';
  const set = (n) => onChange(Math.max(1, Math.min(n, max)));
  return (
    <div className="inline-flex items-center rounded-full border border-ink-200 bg-white">
      <button type="button" onClick={() => set(value - 1)} aria-label="Decrease quantity"
        className={`${pad} grid place-items-center rounded-full text-ink-500 transition hover:text-gold-600 disabled:opacity-30`}
        disabled={value <= 1}>
        <Minus size={15} />
      </button>
      <input
        type="number" value={value} min={1} max={max} aria-label="Quantity"
        onChange={(e) => set(Number(e.target.value))}
        className="w-10 border-0 bg-transparent text-center text-sm font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button type="button" onClick={() => set(value + 1)} aria-label="Increase quantity"
        className={`${pad} grid place-items-center rounded-full text-ink-500 transition hover:text-gold-600 disabled:opacity-30`}
        disabled={value >= max}>
        <Plus size={15} />
      </button>
    </div>
  );
}
