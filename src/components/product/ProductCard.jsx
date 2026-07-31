'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import Img from '@/components/ui/Img';
import Rating from '@/components/ui/Rating';
import { money, percentOff } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import QuickView from './QuickView';

export default function ProductCard({ product, compact = false }) {
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const [quickView, setQuickView] = useState(false);
  const off = percentOff(product.price, product.comparePrice);
  const saved = has(product.id);
  const soldOut = product.stock === 0;

  return (
    <>
      <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-lift">
        <div className="relative aspect-square overflow-hidden bg-cream-dark">
          <Link href={`/product/${product.slug}/`} className="block h-full w-full">
            <Img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          </Link>

          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
            {product.isNew && (
              <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cream">New</span>
            )}
            {off > 0 && (
              <span className="rounded-full bg-gold-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">-{off}%</span>
            )}
            {soldOut && (
              <span className="rounded-full bg-ink-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Sold out</span>
            )}
          </div>

          <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100 md:translate-x-2 md:group-hover:translate-x-0">
            <button
              type="button"
              onClick={() => toggle(product)}
              aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`grid h-9 w-9 place-items-center rounded-full shadow-soft transition ${
                saved ? 'bg-gold-500 text-white' : 'bg-white text-ink hover:bg-gold-500 hover:text-white'
              }`}
            >
              <Heart size={15} className={saved ? 'fill-current' : ''} />
            </button>
            <button
              type="button"
              onClick={() => setQuickView(true)}
              aria-label="Quick view"
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow-soft transition hover:bg-gold-500 hover:text-white"
            >
              <Eye size={15} />
            </button>
          </div>

          {!soldOut && (
            <button
              type="button"
              onClick={() => add(product, 1)}
              className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-2 rounded-full bg-ink py-2.5 text-xs font-semibold text-cream opacity-0 transition-all duration-300 hover:bg-gold-500 group-hover:translate-y-0 group-hover:opacity-100"
            >
              <ShoppingBag size={14} /> Add to cart
            </button>
          )}
        </div>

        <div className={`flex flex-1 flex-col gap-1.5 ${compact ? 'p-3.5' : 'p-4'}`}>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-600">
            {product.category}
          </span>
          <h3 className="text-[15px] font-semibold leading-snug text-ink">
            <Link href={`/product/${product.slug}/`} className="link-underline">{product.name}</Link>
          </h3>
          {!compact && <Rating value={product.rating} count={product.reviewCount} />}
          <div className="mt-auto flex items-baseline gap-2 pt-1.5">
            <span className="text-lg font-bold text-ink">{money(product.price)}</span>
            {product.comparePrice > product.price && (
              <span className="text-sm text-ink-300 line-through">{money(product.comparePrice)}</span>
            )}
          </div>
        </div>
      </article>

      <QuickView product={product} open={quickView} onClose={() => setQuickView(false)} />
    </>
  );
}
