'use client';

import Link from 'next/link';
import { ShoppingBag, X, Trash2 } from 'lucide-react';
import Img from '@/components/ui/Img';
import QuantityInput from '@/components/ui/QuantityInput';
import { money } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useScrollLock } from '@/lib/hooks';

export default function CartDrawer() {
  const { items, subtotal, count, drawerOpen, setDrawerOpen, updateQuantity, removeItem } = useCart();
  useScrollLock(drawerOpen);

  const remaining = Math.max(0, 2000 - subtotal);
  const progress = Math.min(100, (subtotal / 2000) * 100);

  return (
    <>
      {drawerOpen && <div className="fixed inset-0 z-[108] animate-fade-in bg-ink/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />}
      <aside
        className={`fixed right-0 top-0 z-[109] flex h-full w-[min(92vw,420px)] flex-col bg-white shadow-lift transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!drawerOpen}
      >
        <header className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag size={18} className="text-gold-500" /> Your cart
            <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs font-bold text-gold-700">{count}</span>
          </h2>
          <button onClick={() => setDrawerOpen(false)} aria-label="Close cart" className="rounded-full p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink">
            <X size={18} />
          </button>
        </header>

        {items.length > 0 && (
          <div className="border-b border-ink-100 bg-cream px-5 py-3">
            <p className="text-xs text-ink-500">
              {remaining > 0 ? <>Add <strong className="text-gold-700">{money(remaining)}</strong> for free delivery</> : <strong className="text-emerald-700">Free delivery unlocked</strong>}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
              <div className="h-full rounded-full bg-gold-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-gold-50 text-gold-500"><ShoppingBag size={24} /></div>
              <p className="font-semibold">Your cart is empty</p>
              <p className="max-w-[240px] text-sm text-ink-400">Have a look through the collection, everything is made to order in Adelaide.</p>
              <Link href="/shop/" onClick={() => setDrawerOpen(false)} className="btn-primary btn-sm mt-1">Browse the shop</Link>
            </div>
          ) : (
            <ul className="divide-y divide-ink-100">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3 py-4">
                  <Link href={`/product/${item.slug}/`} onClick={() => setDrawerOpen(false)}>
                    <Img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg bg-cream-dark object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/product/${item.slug}/`} onClick={() => setDrawerOpen(false)} className="text-sm font-semibold leading-snug hover:text-gold-600">
                        {item.name}
                      </Link>
                      <button onClick={() => removeItem(item.key)} aria-label="Remove item" className="shrink-0 text-ink-300 transition hover:text-rose-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    {item.variant && <span className="text-xs text-ink-400">{item.variant}</span>}
                    <div className="mt-auto flex items-center justify-between">
                      <QuantityInput value={item.quantity} onChange={(q) => updateQuantity(item.key, q)} max={99} size="sm" />
                      <span className="text-sm font-bold">{money(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="space-y-3 border-t border-ink-100 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">Subtotal</span>
              <span className="text-lg font-bold">{money(subtotal)}</span>
            </div>
            <p className="text-xs text-ink-400">Delivery and any discount codes are calculated at checkout.</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/cart/" onClick={() => setDrawerOpen(false)} className="btn-outline">View cart</Link>
              <Link href="/checkout/" onClick={() => setDrawerOpen(false)} className="btn-dark">Checkout</Link>
            </div>
          </footer>
        )}
      </aside>
    </>
  );
}
