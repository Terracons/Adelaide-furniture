'use client';

import { useState } from 'react';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { money } from '@/lib/format';

function Group({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ink-100 py-4 last:border-0">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left">
        <span className="text-[13px] font-bold uppercase tracking-wider text-ink">{title}</span>
        <ChevronDown size={15} className={`text-ink-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-3.5 space-y-2.5">{children}</div>}
    </div>
  );
}

export default function Filters({ categories, options, value, onChange, onReset, resultCount }) {
  const toggleColor = (c) => {
    const next = value.colors.includes(c) ? value.colors.filter((x) => x !== c) : [...value.colors, c];
    onChange({ colors: next });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between pb-2">
        <span className="flex items-center gap-2 text-sm font-bold"><SlidersHorizontal size={15} className="text-gold-500" /> Filters</span>
        <button onClick={onReset} className="text-xs font-semibold text-gold-600 hover:underline">Reset</button>
      </div>

      <Group title="Category">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="radio" name="cat" checked={value.category === 'all'} onChange={() => onChange({ category: 'all' })}
            className="h-4 w-4 accent-gold-500" />
          <span className={value.category === 'all' ? 'font-semibold text-gold-700' : 'text-ink-600'}>All furniture</span>
        </label>
        {categories.map((c) => (
          <label key={c.slug} className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input type="radio" name="cat" checked={value.category === c.slug} onChange={() => onChange({ category: c.slug })}
              className="h-4 w-4 accent-gold-500" />
            <span className={`flex-1 ${value.category === c.slug ? 'font-semibold text-gold-700' : 'text-ink-600'}`}>{c.name}</span>
            <span className="text-xs text-ink-300">{c.count}</span>
          </label>
        ))}
      </Group>

      <Group title="Price">
        <div className="flex items-center justify-between text-xs text-ink-500">
          <span>{money(options.minPrice)}</span>
          <span className="font-semibold text-gold-700">Up to {money(value.maxPrice)}</span>
        </div>
        <input
          type="range" min={options.minPrice} max={options.maxPrice} step={50}
          value={value.maxPrice} onChange={(e) => onChange({ maxPrice: Number(e.target.value) })}
          aria-label="Maximum price"
          className="w-full accent-gold-500"
        />
        <div className="flex gap-2 pt-1">
          {[500, 1500, 3000].map((p) => (
            <button key={p} onClick={() => onChange({ maxPrice: p })}
              className="rounded-full border border-ink-200 px-2.5 py-1 text-[11px] text-ink-500 transition hover:border-gold-500 hover:text-gold-600">
              Under {money(p)}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Finish">
        <div className="flex flex-wrap gap-1.5">
          {options.colors.map((c) => (
            <button key={c} onClick={() => toggleColor(c)}
              className={`rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition ${
                value.colors.includes(c) ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-ink-200 text-ink-500 hover:border-gold-400'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Availability">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-600">
          <input type="checkbox" checked={value.inStock} onChange={(e) => onChange({ inStock: e.target.checked })}
            className="h-4 w-4 rounded accent-gold-500" />
          In stock only
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-600">
          <input type="checkbox" checked={value.isNew} onChange={(e) => onChange({ isNew: e.target.checked })}
            className="h-4 w-4 rounded accent-gold-500" />
          New arrivals
        </label>
      </Group>

      <p className="pt-3 text-xs text-ink-400">{resultCount} pieces match</p>
    </div>
  );
}

export function ActiveChips({ value, categories, onChange, onReset }) {
  const chips = [];
  if (value.category !== 'all') {
    const c = categories.find((x) => x.slug === value.category);
    chips.push({ label: c?.name || value.category, clear: () => onChange({ category: 'all' }) });
  }
  value.colors.forEach((c) => chips.push({ label: c, clear: () => onChange({ colors: value.colors.filter((x) => x !== c) }) }));
  if (value.inStock) chips.push({ label: 'In stock', clear: () => onChange({ inStock: false }) });
  if (value.isNew) chips.push({ label: 'New arrivals', clear: () => onChange({ isNew: false }) });
  if (value.search) chips.push({ label: `"${value.search}"`, clear: () => onChange({ search: '' }) });

  if (!chips.length) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip, i) => (
        <button key={i} onClick={chip.clear}
          className="flex items-center gap-1.5 rounded-full bg-gold-50 px-3 py-1.5 text-xs font-medium text-gold-700 transition hover:bg-gold-100">
          {chip.label} <X size={12} />
        </button>
      ))}
      <button onClick={onReset} className="text-xs font-semibold text-ink-400 hover:text-gold-600">Clear all</button>
    </div>
  );
}
