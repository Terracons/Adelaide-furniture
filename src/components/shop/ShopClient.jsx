'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LayoutGrid, List, SlidersHorizontal, X, PackageSearch } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import Filters, { ActiveChips } from './Filters';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import Img from '@/components/ui/Img';
import Rating from '@/components/ui/Rating';
import Link from 'next/link';
import { getProducts } from '@/lib/data';
import { useDebounced, useScrollLock } from '@/lib/hooks';
import { money } from '@/lib/format';
import { subscribe } from '@/lib/store';

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name-asc', label: 'Name: A-Z' }
];

const PER_PAGE = 12;

export default function ShopClient({ categories, options, initialCategory = 'all', initial }) {
  const params = useSearchParams();

  const [state, setState] = useState({
    category: initialCategory,
    search: '',
    maxPrice: options.maxPrice,
    colors: [],
    inStock: false,
    isNew: false,
    sort: 'featured',
    page: 1
  });
  const [view, setView] = useState('grid');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [result, setResult] = useState(initial || { items: [], total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(false);
  useScrollLock(sheetOpen);

  // hydrate from ?q= and ?sort= in the URL
  useEffect(() => {
    if (!params) return;
    const q = params.get('q');
    const sort = params.get('sort');
    const cat = params.get('category');
    if (q || sort || cat) {
      setState((s) => ({ ...s, search: q || s.search, sort: sort || s.sort, category: cat || s.category, page: 1 }));
    }
  }, [params]);

  const debouncedSearch = useDebounced(state.search, 250);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getProducts({
      category: state.category,
      search: debouncedSearch,
      maxPrice: state.maxPrice,
      colors: state.colors,
      inStock: state.inStock,
      isNew: state.isNew,
      sort: state.sort,
      page: state.page,
      perPage: PER_PAGE
    });
    setResult(res);
    setLoading(false);
  }, [state.category, debouncedSearch, state.maxPrice, state.colors, state.inStock, state.isNew, state.sort, state.page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => subscribe(() => load()), [load]);

  const update = useCallback((patch) => {
    setState((s) => ({ ...s, ...patch, page: patch.page ?? 1 }));
  }, []);

  const reset = useCallback(() => {
    setState({
      category: 'all', search: '', maxPrice: options.maxPrice, colors: [],
      inStock: false, isNew: false, sort: 'featured', page: 1
    });
  }, [options.maxPrice]);

  const filterPanel = useMemo(
    () => (
      <Filters
        categories={categories}
        options={options}
        value={state}
        onChange={update}
        onReset={reset}
        resultCount={result.total}
      />
    ),
    [categories, options, state, update, reset, result.total]
  );

  return (
    <div className="container grid gap-8 pb-16 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-28 rounded-2xl bg-white p-5 shadow-soft">{filterPanel}</div>
      </aside>

      <div>
        {/* toolbar */}
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3.5 shadow-soft">
          <button onClick={() => setSheetOpen(true)} className="btn-outline btn-sm lg:hidden">
            <SlidersHorizontal size={14} /> Filters
          </button>

          <input
            value={state.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search the catalogue..."
            aria-label="Search products"
            className="field h-10 flex-1 min-w-[160px] py-2"
          />

          <select
            value={state.sort}
            onChange={(e) => update({ sort: e.target.value })}
            aria-label="Sort products"
            className="field h-10 w-auto py-2 pr-8 text-sm"
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <div className="hidden items-center gap-1 rounded-lg border border-ink-200 p-1 sm:flex">
            <button onClick={() => setView('grid')} aria-label="Grid view"
              className={`grid h-8 w-8 place-items-center rounded ${view === 'grid' ? 'bg-ink text-cream' : 'text-ink-400'}`}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setView('list')} aria-label="List view"
              className={`grid h-8 w-8 place-items-center rounded ${view === 'list' ? 'bg-ink text-cream' : 'text-ink-400'}`}>
              <List size={15} />
            </button>
          </div>
        </div>

        <ActiveChips value={state} categories={categories} onChange={update} onReset={reset} />

        {loading && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
          </div>
        )}

        {!loading && result.items.length === 0 && (
          <EmptyState
            icon={PackageSearch}
            title="Nothing matches those filters"
            description="Try widening the price range or clearing a filter or two."
          >
            <button onClick={reset} className="btn-primary btn-sm">Clear all filters</button>
          </EmptyState>
        )}

        {!loading && result.items.length > 0 && view === 'grid' && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {result.items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {!loading && result.items.length > 0 && view === 'list' && (
          <div className="space-y-3">
            {result.items.map((p) => (
              <article key={p.id} className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-soft sm:flex-row">
                <Link href={`/product/${p.slug}/`} className="w-full shrink-0 overflow-hidden rounded-xl bg-cream-dark sm:w-44">
                  <Img src={p.image} alt={p.name} className="aspect-square h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-600">{p.category}</span>
                  <h3 className="text-lg font-semibold"><Link href={`/product/${p.slug}/`} className="hover:text-gold-600">{p.name}</Link></h3>
                  <Rating value={p.rating} count={p.reviewCount} />
                  <p className="text-sm leading-relaxed text-ink-500">{p.shortDescription}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">{money(p.price)}</span>
                      {p.comparePrice > p.price && <span className="text-sm text-ink-300 line-through">{money(p.comparePrice)}</span>}
                    </div>
                    <Link href={`/product/${p.slug}/`} className="btn-dark btn-sm">View details</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <Pagination page={result.page} pages={result.pages} onChange={(page) => {
          setState((s) => ({ ...s, page }));
          window.scrollTo({ top: 200, behavior: 'smooth' });
        }} />
      </div>

      {/* mobile filter sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[110] lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setSheetOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] animate-fade-up overflow-y-auto rounded-t-3xl bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setSheetOpen(false)} aria-label="Close filters" className="p-1.5"><X size={19} /></button>
            </div>
            {filterPanel}
            <button onClick={() => setSheetOpen(false)} className="btn-primary mt-4 w-full">
              Show {result.total} pieces
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
