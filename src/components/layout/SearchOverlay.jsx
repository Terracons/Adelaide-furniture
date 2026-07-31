'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import Img from '@/components/ui/Img';
import { searchProducts } from '@/lib/data';
import { money } from '@/lib/format';
import { useDebounced, useScrollLock } from '@/lib/hooks';

export default function SearchOverlay({ open, onClose }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const debounced = useDebounced(term, 220);
  const inputRef = useRef(null);
  const router = useRouter();
  useScrollLock(open);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
    else setTerm('');
  }, [open]);

  useEffect(() => {
    let active = true;
    if (debounced.trim().length < 2) {
      setResults([]);
      return undefined;
    }
    searchProducts(debounced, 6).then((r) => { if (active) setResults(r); });
    return () => { active = false; };
  }, [debounced]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  function submit(e) {
    e.preventDefault();
    if (!term.trim()) return;
    onClose();
    router.push(`/shop/?q=${encodeURIComponent(term.trim())}`);
  }

  return (
    <div className="fixed inset-0 z-[105]">
      <div className="absolute inset-0 animate-fade-in bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-auto mt-24 w-[min(94vw,640px)] animate-fade-up overflow-hidden rounded-2xl bg-white shadow-lift">
        <form onSubmit={submit} className="flex items-center gap-3 border-b border-ink-100 px-5 py-4">
          <Search size={19} className="shrink-0 text-gold-500" />
          <input
            ref={inputRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search sofas, tables, lighting..."
            className="flex-1 bg-transparent text-[15px] placeholder:text-ink-300"
          />
          <button type="button" onClick={onClose} aria-label="Close search" className="rounded-full p-1 text-ink-400 hover:text-ink">
            <X size={18} />
          </button>
        </form>

        <div className="max-h-[55vh] overflow-y-auto">
          {term.trim().length >= 2 && results.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-ink-400">
              Nothing matched &ldquo;{term}&rdquo;. Try a room or a material.
            </p>
          )}
          {results.map((p) => (
            <Link key={p.id} href={`/product/${p.slug}/`} onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-cream">
              <Img src={p.image} alt={p.name} className="h-14 w-14 rounded-lg bg-cream-dark object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <p className="text-xs capitalize text-ink-400">{p.category}</p>
              </div>
              <span className="text-sm font-bold text-gold-600">{money(p.price)}</span>
            </Link>
          ))}
          {term.trim().length < 2 && (
            <div className="px-5 py-5">
              <p className="label">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {['sofa', 'oak table', 'brass pendant', 'armchair', 'rug', 'bed'].map((s) => (
                  <button key={s} onClick={() => setTerm(s)}
                    className="rounded-full border border-ink-200 px-3 py-1.5 text-xs text-ink-500 transition hover:border-gold-500 hover:text-gold-600">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
