'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, Star, ArrowRight, RotateCcw } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import StatCard from '@/components/admin/StatCard';
import Badge from '@/components/ui/Badge';
import Img from '@/components/ui/Img';
import { money, formatDate } from '@/lib/format';
import { getStats, resetDemoData } from '@/lib/data';
import { useData } from '@/lib/hooks';
import { useToast } from '@/context/ToastContext';

const Charts = dynamic(() => import('./Charts'), {
  ssr: false,
  loading: () => <div className="skeleton h-72 w-full rounded-2xl" />
});

export default function DashboardClient() {
  const { data: stats, refresh } = useData(() => getStats(), [], null);
  const { toast } = useToast();

  async function reset() {
    await resetDemoData();
    refresh();
    toast('Demo data restored to its original state');
  }

  if (!stats) {
    return (
      <AdminShell title="Dashboard">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Everything happening in the store right now"
      actions={
        <button onClick={reset} className="btn-outline btn-sm" title="Restore the shipped demo data">
          <RotateCcw size={13} /> <span className="hidden sm:inline">Reset demo data</span>
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={DollarSign} label="Total revenue" value={money(stats.revenue, { decimals: false })} delta={12.4} tone="gold"
          hint={`Average order ${money(stats.avgOrderValue, { decimals: false })}`} />
        <StatCard icon={ShoppingCart} label="Orders" value={stats.orderCount} delta={8.1} tone="blue"
          hint={`${stats.unitsSold} units shipped`} />
        <StatCard icon={Users} label="Customers" value={stats.customerCount} delta={5.6} tone="green" />
        <StatCard icon={Package} label="Products" value={stats.productCount} tone="rose"
          hint={`${stats.lowStock} low stock, ${stats.outOfStock} out`} />
      </div>

      {(stats.lowStock > 0 || stats.pendingReviews > 0) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {stats.lowStock > 0 && (
            <Link href="/admin/products/" className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:shadow-soft">
              <AlertTriangle size={19} className="shrink-0 text-amber-600" />
              <p className="flex-1 text-sm text-amber-900">
                <strong>{stats.lowStock} products</strong> are running low on stock
              </p>
              <ArrowRight size={16} className="text-amber-600" />
            </Link>
          )}
          {stats.pendingReviews > 0 && (
            <Link href="/admin/reviews/" className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 transition hover:shadow-soft">
              <Star size={19} className="shrink-0 text-blue-600" />
              <p className="flex-1 text-sm text-blue-900">
                <strong>{stats.pendingReviews} reviews</strong> waiting for moderation
              </p>
              <ArrowRight size={16} className="text-blue-600" />
            </Link>
          )}
        </div>
      )}

      <div className="mt-4">
        <Charts stats={stats} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-2xl bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="font-semibold">Recent orders</h2>
            <Link href="/admin/orders/" className="text-xs font-semibold text-gold-600 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <tbody className="divide-y divide-ink-100">
                {stats.recentOrders.map((o) => (
                  <tr key={o.id} className="transition hover:bg-cream/50">
                    <td className="px-5 py-3">
                      <p className="font-semibold">{o.orderNumber}</p>
                      <p className="text-xs text-ink-400">{o.customerName}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-ink-400">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3"><Badge tone={o.status}>{o.status}</Badge></td>
                    <td className="px-5 py-3 text-right font-bold">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-soft">
          <h2 className="font-semibold">Best sellers</h2>
          <ul className="mt-4 space-y-3">
            {stats.topProducts.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="w-4 text-xs font-bold text-ink-300">{i + 1}</span>
                <Img src={p.image} alt={p.name} className="h-11 w-11 rounded-lg bg-cream-dark object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-ink-400">{p.qty} sold</p>
                </div>
                <span className="text-sm font-bold text-gold-700">{money(p.revenue, { decimals: false })}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminShell>
  );
}
