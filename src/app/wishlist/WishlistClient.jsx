'use client';

import { Heart } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ProductCard from '@/components/product/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import { useWishlist } from '@/context/WishlistContext';
import { getAllProducts } from '@/lib/data';
import { useData } from '@/lib/hooks';

export default function WishlistClient() {
  const { ids, ready, clear } = useWishlist();
  const { data: products } = useData(() => getAllProducts(), [], []);
  const saved = (products || []).filter((p) => ids.includes(p.id));

  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ label: 'Wishlist' }]} />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold md:text-[38px]">Your wishlist</h1>
          <p className="mt-1.5 text-sm text-ink-500">{saved.length} pieces saved for later</p>
        </div>
        {saved.length > 0 && (
          <button onClick={clear} className="text-xs font-semibold text-ink-400 hover:text-rose-500">Clear wishlist</button>
        )}
      </div>

      <div className="mt-8">
        {!ready ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
          </div>
        ) : saved.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Nothing saved yet"
            description="Tap the heart on any piece to keep it here while you think about it."
            actionLabel="Browse the shop"
            actionHref="/shop/"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {saved.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
