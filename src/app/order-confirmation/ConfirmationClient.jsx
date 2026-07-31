'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, Printer, Truck, Mail } from 'lucide-react';
import Img from '@/components/ui/Img';
import EmptyState from '@/components/ui/EmptyState';
import { money, formatDate } from '@/lib/format';
import { getOrder } from '@/lib/data';

export default function ConfirmationClient() {
  const params = useSearchParams();
  const number = params?.get('order');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!number) { setLoading(false); return; }
    getOrder(number).then((o) => { setOrder(o); setLoading(false); });
  }, [number]);

  if (loading) return <div className="container py-24 text-center text-sm text-ink-400">Loading your order...</div>;

  if (!order) {
    return (
      <div className="container py-12">
        <EmptyState icon={Package} title="We could not find that order"
          description="Check the link in your confirmation email, or sign in to see your order history."
          actionLabel="Go to your account" actionHref="/account/orders/" />
      </div>
    );
  }

  const eta = new Date(Date.now() + 7 * 86400000);

  return (
    <div className="container max-w-3xl py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={30} />
        </span>
        <h1 className="text-3xl font-semibold md:text-4xl">Thank you, {order.customerName.split(' ')[0]}</h1>
        <p className="max-w-md text-[15px] leading-relaxed text-ink-500">
          Your order is confirmed. We have sent a receipt to <strong className="text-ink">{order.customerEmail}</strong>,
          and our workshop team will be in touch within 48 hours to lock in your delivery slot.
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <InfoTile icon={Package} label="Order number" value={order.orderNumber} />
        <InfoTile icon={Truck} label="Estimated delivery" value={formatDate(eta, 'long')} />
        <InfoTile icon={Mail} label="Payment" value={`${order.paymentMethod} - ${order.paymentStatus}`} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-semibold">Order summary</h2>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-gold-600 hover:underline">
            <Printer size={14} /> Print
          </button>
        </div>

        <ul className="divide-y divide-ink-100 px-5">
          {order.items.map((i, idx) => (
            <li key={idx} className="flex items-center gap-3 py-4">
              <Img src={i.image} alt={i.name} className="h-16 w-16 rounded-lg bg-cream-dark object-cover" />
              <div className="min-w-0 flex-1">
                <Link href={`/product/${i.slug}/`} className="text-sm font-semibold hover:text-gold-600">{i.name}</Link>
                <p className="text-xs text-ink-400">{i.variant} &middot; Qty {i.quantity}</p>
              </div>
              <span className="text-sm font-bold">{money(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t border-ink-100 px-5 py-4 text-sm">
          <div className="flex justify-between"><dt className="text-ink-500">Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between"><dt className="text-ink-500">Discount {order.couponCode && `(${order.couponCode})`}</dt><dd className="text-emerald-600">- {money(order.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-ink-500">Delivery</dt><dd>{order.shipping === 0 ? 'Free' : money(order.shipping)}</dd></div>
          <div className="flex items-baseline justify-between border-t border-ink-100 pt-3 text-base">
            <dt className="font-semibold">Total paid</dt><dd className="text-xl font-bold">{money(order.total)}</dd>
          </div>
        </dl>

        <div className="grid gap-4 border-t border-ink-100 bg-cream px-5 py-4 text-xs leading-relaxed text-ink-500 sm:grid-cols-2">
          <div>
            <p className="label">Delivering to</p>
            <p>{order.customerName}<br />{order.address}<br />{order.city} {order.state} {order.postcode}<br />{order.country}</p>
          </div>
          <div>
            <p className="label">Contact</p>
            <p>{order.customerEmail}<br />{order.customerPhone}</p>
            {order.notes && <><p className="label mt-3">Notes</p><p>{order.notes}</p></>}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/shop/" className="btn-primary">Keep shopping</Link>
        <Link href="/account/orders/" className="btn-outline">View order history</Link>
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-50 text-gold-600"><Icon size={17} /></span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">{label}</p>
        <p className="truncate text-sm font-semibold capitalize">{value}</p>
      </div>
    </div>
  );
}
