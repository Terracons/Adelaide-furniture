'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShoppingBag, Trash2, Tag, ArrowRight, Truck, X } from 'lucide-react';
import Img from '@/components/ui/Img';
import QuantityInput from '@/components/ui/QuantityInput';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import EmptyState from '@/components/ui/EmptyState';
import { money } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { validateCoupon } from '@/lib/data';

export default function CartClient() {
  const { items, ready, subtotal, discount, shipping, total, coupon, applyCoupon, updateQuantity, removeItem, clear } = useCart();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  async function apply(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    const res = await validateCoupon(code, subtotal);
    setBusy(false);
    applyCoupon(res);
    toast(res.message, res.valid ? 'success' : 'error');
    if (res.valid) setCode('');
  }

  if (!ready) {
    return <div className="container py-24 text-center text-sm text-ink-400">Loading your cart...</div>;
  }

  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ label: 'Cart' }]} />
      <h1 className="mt-3 text-3xl font-semibold md:text-[38px]">Your cart</h1>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Nothing here yet. Everything in the collection is made to order in our Adelaide workshop."
            actionLabel="Browse the shop"
            actionHref="/shop/"
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
              <div className="hidden border-b border-ink-100 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-ink-400 sm:grid sm:grid-cols-[1fr_120px_120px_40px]">
                <span>Item</span><span className="text-center">Quantity</span><span className="text-right">Total</span><span />
              </div>

              <ul className="divide-y divide-ink-100">
                {items.map((item) => (
                  <li key={item.key} className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_120px_120px_40px] sm:items-center">
                    <div className="flex gap-4">
                      <Link href={`/product/${item.slug}/`} className="shrink-0">
                        <Img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl bg-cream-dark object-cover" />
                      </Link>
                      <div className="min-w-0">
                        <Link href={`/product/${item.slug}/`} className="text-[15px] font-semibold leading-snug hover:text-gold-600">
                          {item.name}
                        </Link>
                        {item.variant && <p className="mt-0.5 text-xs text-ink-400">Finish: {item.variant}</p>}
                        <p className="mt-1.5 text-sm font-semibold text-gold-700">{money(item.price)}</p>
                      </div>
                    </div>

                    <div className="flex justify-start sm:justify-center">
                      <QuantityInput value={item.quantity} onChange={(q) => updateQuantity(item.key, q)} max={99} size="sm" />
                    </div>

                    <span className="text-left text-base font-bold sm:text-right">{money(item.price * item.quantity)}</span>

                    <button onClick={() => removeItem(item.key)} aria-label="Remove"
                      className="justify-self-start text-ink-300 transition hover:text-rose-500 sm:justify-self-end">
                      <Trash2 size={17} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Link href="/shop/" className="btn-ghost btn-sm">&larr; Keep shopping</Link>
              <button onClick={clear} className="text-xs font-semibold text-ink-400 hover:text-rose-500">Clear cart</button>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <div className="space-y-4 rounded-2xl bg-white p-5 shadow-soft">
              <h2 className="text-lg font-semibold">Order summary</h2>

              <form onSubmit={apply}>
                <label className="label">Discount code</label>
                {coupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3.5 py-2.5">
                    <span className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                      <Tag size={14} /> {coupon.code}
                    </span>
                    <button type="button" onClick={() => applyCoupon(null)} aria-label="Remove code" className="text-emerald-700 hover:text-emerald-900">
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. WELCOME10"
                      className="field py-2.5 uppercase" aria-label="Discount code" />
                    <button type="submit" disabled={busy} className="btn-dark btn-sm shrink-0">Apply</button>
                  </div>
                )}
                <p className="mt-1.5 text-[11px] text-ink-400">Try WELCOME10, GOLD500 or FREIGHTFREE</p>
              </form>

              <dl className="space-y-2.5 border-t border-ink-100 pt-4 text-sm">
                <Row label="Subtotal" value={money(subtotal)} />
                {discount > 0 && <Row label="Discount" value={`- ${money(discount)}`} tone="text-emerald-600" />}
                <Row label="Delivery" value={shipping === 0 ? 'Free' : money(shipping)} />
                <div className="flex items-baseline justify-between border-t border-ink-100 pt-3">
                  <dt className="font-semibold">Total</dt>
                  <dd className="text-2xl font-bold">{money(total)}</dd>
                </div>
                <p className="text-[11px] text-ink-400">Includes GST of {money(total / 11)}</p>
              </dl>

              {shipping > 0 && (
                <p className="flex items-start gap-2 rounded-xl bg-gold-50 p-3 text-xs text-gold-800">
                  <Truck size={14} className="mt-0.5 shrink-0" />
                  Add {money(2000 - (subtotal - discount))} more to unlock free two-person delivery.
                </p>
              )}

              <Link href="/checkout/" className="btn-primary w-full">
                Proceed to checkout <ArrowRight size={16} />
              </Link>

              <p className="text-center text-[11px] leading-relaxed text-ink-400">
                Secure checkout &middot; 30-day at-home trial &middot; 10-year frame warranty
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, tone = '' }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-ink-500">{label}</dt>
      <dd className={`font-semibold ${tone}`}>{value}</dd>
    </div>
  );
}
