'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, ShoppingBag, Truck, Undo2, ShieldCheck, Check, Minus, Plus, Share2 } from 'lucide-react';
import Rating from '@/components/ui/Rating';
import QuantityInput from '@/components/ui/QuantityInput';
import Badge from '@/components/ui/Badge';
import { money, percentOff } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';

export default function ProductPanel({ product }) {
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [colour, setColour] = useState(product.colors?.[0] || null);
  const [openSpec, setOpenSpec] = useState('details');

  const off = percentOff(product.price, product.comparePrice);
  const saved = has(product.id);
  const soldOut = product.stock === 0;
  const low = product.stock > 0 && product.stock < 10;

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard?.writeText(url);
      toast('Link copied to clipboard');
    }
  }

  const SPECS = [
    { key: 'details', label: 'Description', content: <div className="space-y-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-ink-500 [&_strong]:text-ink" dangerouslySetInnerHTML={{ __html: product.description }} /> },
    {
      key: 'specs',
      label: 'Specifications',
      content: (
        <dl className="divide-y divide-ink-100 text-sm">
          {[
            ['SKU', product.sku],
            ['Materials', product.materials],
            ['Dimensions', product.dimensions],
            ['Weight', product.weight],
            ['Finishes', (product.colors || []).join(', ')],
            ['Collection', product.category]
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 py-2.5">
              <dt className="text-ink-400">{k}</dt>
              <dd className="text-right font-medium capitalize text-ink-700">{v || '-'}</dd>
            </div>
          ))}
        </dl>
      )
    },
    {
      key: 'delivery',
      label: 'Delivery & returns',
      content: (
        <div className="space-y-3 text-sm leading-relaxed text-ink-500">
          <p><strong className="text-ink">In stock pieces</strong> leave the workshop in 3-5 business days. Made-to-order upholstery takes 6-8 weeks and we confirm your build slot within 48 hours.</p>
          <p><strong className="text-ink">Two-person delivery</strong> is $149 flat to metro areas and free over $2,000. We bring it into the room, unpack it, assemble it and take the packaging away.</p>
          <p><strong className="text-ink">30-day trial.</strong> If it does not suit the room we collect it and refund you in full, less return freight which we quote up front.</p>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Link href={`/category/${product.category}/`} className="eyebrow capitalize hover:underline">{product.category}</Link>
          {product.isNew && <Badge tone="active">New</Badge>}
          {off > 0 && <Badge>Save {off}%</Badge>}
        </div>
        <h1 className="text-3xl font-semibold leading-tight md:text-[38px]">{product.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Rating value={product.rating} count={product.reviewCount} showValue />
          <span className="text-xs text-ink-300">|</span>
          <span className="text-xs text-ink-400">SKU {product.sku}</span>
        </div>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-ink">{money(product.price)}</span>
        {off > 0 && <span className="text-lg text-ink-300 line-through">{money(product.comparePrice)}</span>}
        {off > 0 && <span className="rounded-full bg-gold-100 px-2.5 py-1 text-xs font-bold text-gold-700">You save {money(product.comparePrice - product.price)}</span>}
      </div>

      <p className="text-[15px] leading-relaxed text-ink-500">{product.shortDescription}</p>

      {product.colors?.length > 0 && (
        <div>
          <span className="label">Finish: <span className="normal-case text-ink">{colour}</span></span>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button key={c} onClick={() => setColour(c)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition ${
                  colour === c ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-ink-200 text-ink-500 hover:border-gold-400'
                }`}>
                {colour === c && <Check size={12} strokeWidth={3} />}
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        {soldOut ? (
          <span className="flex items-center gap-1.5 font-semibold text-rose-600">Currently sold out</span>
        ) : low ? (
          <span className="flex items-center gap-1.5 font-semibold text-amber-600">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Only {product.stock} left in stock
          </span>
        ) : (
          <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> In stock, ready to ship
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <QuantityInput value={qty} onChange={setQty} max={Math.max(1, product.stock)} />
        <button onClick={() => add(product, qty, colour)} disabled={soldOut} className="btn-primary flex-1 min-w-[180px]">
          <ShoppingBag size={17} /> {soldOut ? 'Sold out' : `Add to cart · ${money(product.price * qty)}`}
        </button>
        <button onClick={() => toggle(product)} aria-label="Save to wishlist"
          className={`grid h-12 w-12 place-items-center rounded-full border transition ${
            saved ? 'border-gold-500 bg-gold-500 text-white' : 'border-ink-200 text-ink-500 hover:border-gold-500 hover:text-gold-600'
          }`}>
          <Heart size={18} className={saved ? 'fill-current' : ''} />
        </button>
        <button onClick={share} aria-label="Share"
          className="grid h-12 w-12 place-items-center rounded-full border border-ink-200 text-ink-500 transition hover:border-gold-500 hover:text-gold-600">
          <Share2 size={17} />
        </button>
      </div>

      <div className="grid gap-2.5 rounded-2xl bg-cream p-4 sm:grid-cols-3">
        {[
          [Truck, 'Free delivery over $2,000'],
          [Undo2, '30-day home trial'],
          [ShieldCheck, '10-year frame warranty']
        ].map(([Icon, label]) => (
          <div key={label} className="flex items-center gap-2 text-xs text-ink-600">
            <Icon size={16} className="shrink-0 text-gold-500" /> {label}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white">
        {SPECS.map((s) => (
          <div key={s.key} className="border-b border-ink-100 last:border-0">
            <button onClick={() => setOpenSpec(openSpec === s.key ? null : s.key)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-semibold">
              {s.label}
              {openSpec === s.key ? <Minus size={15} className="text-gold-500" /> : <Plus size={15} className="text-ink-400" />}
            </button>
            {openSpec === s.key && <div className="px-4 pb-4">{s.content}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
