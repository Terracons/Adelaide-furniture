'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Package, ChevronDown } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import Img from '@/components/ui/Img';
import EmptyState from '@/components/ui/EmptyState';
import { money, formatDate } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';
import { getOrders } from '@/lib/data';
import { useData } from '@/lib/hooks';

const TIMELINE = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrdersClient() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(null);
  const { data: orders } = useData(() => (user ? getOrders({ userId: user.id }) : Promise.resolve([])), [user?.id], []);

  useEffect(() => { if (ready && !user) router.replace('/account/login/'); }, [ready, user, router]);

  if (!ready || !user) return <div className="container py-24 text-center text-sm text-ink-400">Loading...</div>;

  const list = orders || [];

  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ label: 'Account', href: '/account/' }, { label: 'Orders' }]} />
      <h1 className="mt-3 text-3xl font-semibold md:text-[38px]">Order history</h1>

      <div className="mt-8">
        {list.length === 0 ? (
          <EmptyState icon={Package} title="No orders yet"
            description="When you place an order it will appear here with live delivery status."
            actionLabel="Browse the shop" actionHref="/shop/" />
        ) : (
          <div className="space-y-3">
            {list.map((o) => {
              const stage = TIMELINE.indexOf(o.status);
              return (
                <div key={o.id} className="overflow-hidden rounded-2xl bg-white shadow-soft">
                  <button onClick={() => setOpen(open === o.id ? null : o.id)}
                    className="flex w-full flex-wrap items-center gap-4 p-5 text-left">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{o.orderNumber}</p>
                      <p className="text-xs text-ink-400">{formatDate(o.createdAt, 'long')} &middot; {o.items.length} items &middot; {o.paymentMethod}</p>
                    </div>
                    <Badge tone={o.status}>{o.status}</Badge>
                    <span className="text-lg font-bold">{money(o.total)}</span>
                    <ChevronDown size={17} className={`text-ink-400 transition ${open === o.id ? 'rotate-180' : ''}`} />
                  </button>

                  {open === o.id && (
                    <div className="border-t border-ink-100 px-5 py-5">
                      {o.status !== 'cancelled' && (
                        <ol className="mb-6 flex items-center">
                          {TIMELINE.map((s, i) => (
                            <li key={s} className="flex flex-1 items-center last:flex-none">
                              <div className="flex flex-col items-center gap-1.5">
                                <span className={`h-3 w-3 rounded-full ${i <= stage ? 'bg-gold-500' : 'bg-ink-200'}`} />
                                <span className={`text-[10px] font-semibold uppercase tracking-wider ${i <= stage ? 'text-gold-700' : 'text-ink-300'}`}>{s}</span>
                              </div>
                              {i < TIMELINE.length - 1 && <span className={`mx-1 -mt-4 h-0.5 flex-1 ${i < stage ? 'bg-gold-500' : 'bg-ink-200'}`} />}
                            </li>
                          ))}
                        </ol>
                      )}

                      <ul className="divide-y divide-ink-100">
                        {o.items.map((i, idx) => (
                          <li key={idx} className="flex items-center gap-3 py-3">
                            <Img src={i.image} alt={i.name} className="h-14 w-14 rounded-lg bg-cream-dark object-cover" />
                            <div className="min-w-0 flex-1">
                              <Link href={`/product/${i.slug}/`} className="text-sm font-semibold hover:text-gold-600">{i.name}</Link>
                              <p className="text-xs text-ink-400">{i.variant} &middot; Qty {i.quantity}</p>
                            </div>
                            <span className="text-sm font-bold">{money(i.price * i.quantity)}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 grid gap-4 rounded-xl bg-cream p-4 text-xs leading-relaxed text-ink-500 sm:grid-cols-2">
                        <div>
                          <p className="label">Delivering to</p>
                          <p>{o.address}<br />{o.city} {o.state} {o.postcode}</p>
                        </div>
                        <div className="sm:text-right">
                          <p className="label sm:text-right">Totals</p>
                          <p>Subtotal {money(o.subtotal)}{o.discount > 0 && <> &middot; Discount -{money(o.discount)}</>}<br />
                            Delivery {o.shipping === 0 ? 'Free' : money(o.shipping)} &middot; <strong className="text-ink">Total {money(o.total)}</strong></p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
