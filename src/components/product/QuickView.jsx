'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingBag, Truck, Undo2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Img from '@/components/ui/Img';
import Rating from '@/components/ui/Rating';
import QuantityInput from '@/components/ui/QuantityInput';
import { money, percentOff } from '@/lib/format';
import { useCart } from '@/context/CartContext';

export default function QuickView({ product, open, onClose }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [colour, setColour] = useState(product?.colors?.[0] || null);

  useEffect(() => {
    if (open) {
      setQty(1);
      setColour(product?.colors?.[0] || null);
    }
  }, [open, product]);

  if (!product) return null;
  const off = percentOff(product.price, product.comparePrice);

  return (
    <Modal open={open} onClose={onClose} title="Quick view" width="max-w-3xl">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-cream-dark">
          <Img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-col gap-3">
          <span className="eyebrow">{product.category}</span>
          <h3 className="text-2xl font-semibold leading-tight">{product.name}</h3>
          <Rating value={product.rating} count={product.reviewCount} />
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{money(product.price)}</span>
            {off > 0 && <span className="text-sm text-ink-300 line-through">{money(product.comparePrice)}</span>}
            {off > 0 && <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs font-bold text-gold-700">Save {off}%</span>}
          </div>
          <p className="text-sm leading-relaxed text-ink-500">{product.shortDescription}</p>

          {product.colors?.length > 1 && (
            <div>
              <span className="label">Finish</span>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button key={c} onClick={() => setColour(c)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      colour === c ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-ink-200 text-ink-500 hover:border-gold-400'
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <QuantityInput value={qty} onChange={setQty} max={Math.max(1, product.stock)} />
            <button
              className="btn-primary flex-1"
              disabled={product.stock === 0}
              onClick={() => { add(product, qty, colour); onClose(); }}
            >
              <ShoppingBag size={16} /> {product.stock === 0 ? 'Sold out' : 'Add to cart'}
            </button>
          </div>

          <div className="mt-1 space-y-1.5 border-t border-ink-100 pt-3 text-xs text-ink-400">
            <p className="flex items-center gap-2"><Truck size={14} className="text-gold-500" /> Free two-person delivery over $2,000</p>
            <p className="flex items-center gap-2"><Undo2 size={14} className="text-gold-500" /> 30-day at-home trial</p>
          </div>

          <Link href={`/product/${product.slug}/`} className="text-sm font-semibold text-gold-600 link-underline w-fit">
            View full details
          </Link>
        </div>
      </div>
    </Modal>
  );
}
