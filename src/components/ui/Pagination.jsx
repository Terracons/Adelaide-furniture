'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = [];
  for (let i = 1; i <= pages; i += 1) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '...') nums.push('...');
  }
  return (
    <div className="flex items-center justify-center gap-1.5 pt-4">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page"
        className="grid h-10 w-10 place-items-center rounded-full border border-ink-200 text-ink-500 transition hover:border-gold-500 hover:text-gold-600 disabled:opacity-30">
        <ChevronLeft size={16} />
      </button>
      {nums.map((n, i) =>
        n === '...' ? (
          <span key={`gap-${i}`} className="px-1 text-ink-300">...</span>
        ) : (
          <button key={n} onClick={() => onChange(n)}
            className={`h-10 min-w-[40px] rounded-full px-3 text-sm font-semibold transition ${
              n === page ? 'bg-gold-500 text-white shadow-gold' : 'border border-ink-200 text-ink-500 hover:border-gold-500 hover:text-gold-600'
            }`}>
            {n}
          </button>
        )
      )}
      <button onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="Next page"
        className="grid h-10 w-10 place-items-center rounded-full border border-ink-200 text-ink-500 transition hover:border-gold-500 hover:text-gold-600 disabled:opacity-30">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
