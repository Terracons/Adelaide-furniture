'use client';

import { useMemo, useState } from 'react';
import { ArrowUpDown, Search, Inbox } from 'lucide-react';

/**
 * Small, dependency-free table with search, sort and pagination.
 * columns: [{ key, label, render?, sortable?, className?, align? }]
 */
export default function DataTable({ columns, rows, searchKeys = [], perPage = 10, empty = 'Nothing here yet', toolbar }) {
  const [term, setTerm] = useState('');
  const [sort, setSort] = useState({ key: null, dir: 'asc' });
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let out = rows || [];
    if (term && searchKeys.length) {
      const q = term.toLowerCase();
      out = out.filter((r) => searchKeys.map((k) => String(r[k] ?? '')).join(' ').toLowerCase().includes(q));
    }
    if (sort.key) {
      out = [...out].sort((a, b) => {
        const av = a[sort.key]; const bv = b[sort.key];
        const res = typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av ?? '').localeCompare(String(bv ?? ''));
        return sort.dir === 'asc' ? res : -res;
      });
    }
    return out;
  }, [rows, term, searchKeys, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * perPage, current * perPage);

  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
      <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 p-4">
        {searchKeys.length > 0 && (
          <div className="relative min-w-[200px] flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
            <input value={term} onChange={(e) => { setTerm(e.target.value); setPage(1); }}
              placeholder="Search..." aria-label="Search table"
              className="field py-2 pl-10 text-sm" />
          </div>
        )}
        {toolbar}
        <span className="text-xs text-ink-400">{filtered.length} records</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-cream/60 text-left">
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-ink-400 ${c.align === 'right' ? 'text-right' : ''}`}>
                  {c.sortable !== false ? (
                    <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-gold-600">
                      {c.label} <ArrowUpDown size={11} className={sort.key === c.key ? 'text-gold-500' : 'opacity-40'} />
                    </button>
                  ) : c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {slice.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <Inbox size={26} className="mx-auto mb-2 text-ink-200" />
                  <p className="text-sm text-ink-400">{empty}</p>
                </td>
              </tr>
            )}
            {slice.map((row, i) => (
              <tr key={row.id ?? i} className="transition hover:bg-cream/50">
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 align-middle ${c.align === 'right' ? 'text-right' : ''} ${c.className || ''}`}>
                    {c.render ? c.render(row) : String(row[c.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-ink-100 px-4 py-3">
          <span className="text-xs text-ink-400">Page {current} of {pages}</span>
          <div className="flex gap-1.5">
            <button onClick={() => setPage(current - 1)} disabled={current <= 1} className="btn-outline btn-sm disabled:opacity-30">Prev</button>
            <button onClick={() => setPage(current + 1)} disabled={current >= pages} className="btn-outline btn-sm disabled:opacity-30">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
