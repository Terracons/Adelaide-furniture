'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart, LogOut, Package, Save, User as UserIcon, MapPin } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import { money, formatDate, initials } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { getOrders } from '@/lib/data';
import { useData } from '@/lib/hooks';

const AU_STATES = ['SA', 'VIC', 'NSW', 'QLD', 'WA', 'TAS', 'NT', 'ACT'];

export default function AccountClient() {
  const { user, ready, logout, updateProfile } = useAuth();
  const { count: wishCount } = useWishlist();
  const { toast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data: orders } = useData(() => (user ? getOrders({ userId: user.id }) : Promise.resolve([])), [user?.id], []);

  useEffect(() => { if (ready && !user) router.replace('/account/login/'); }, [ready, user, router]);
  useEffect(() => { if (user && !form) setForm({ ...user }); }, [user, form]);

  if (!ready || !user || !form) {
    return <div className="container py-24 text-center text-sm text-ink-400">Loading your account...</div>;
  }

  const list = orders || [];
  const spent = list.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    await updateProfile(form);
    setBusy(false);
    toast('Details saved');
  }

  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ label: 'Account' }]} />

      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl bg-white p-6 shadow-soft">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-gold-100 text-xl font-bold text-gold-700">
          {initials(user.name)}
        </span>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          <p className="text-sm text-ink-400">{user.email} &middot; Member since {formatDate(user.createdAt, 'long')}</p>
        </div>
        <button onClick={() => { logout(); router.push('/'); }} className="btn-outline btn-sm">
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Tile icon={Package} label="Orders placed" value={list.length} href="/account/orders/" />
        <Tile icon={MapPin} label="Total spent" value={money(spent)} />
        <Tile icon={Heart} label="Wishlist" value={wishCount} href="/wishlist/" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <form onSubmit={save} className="space-y-5 rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><UserIcon size={18} className="text-gold-500" /> Your details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name"><input className="field" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Email"><input type="email" className="field" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          </div>
          <Field label="Phone"><input className="field" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Street address"><input className="field" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Suburb"><input className="field" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            <Field label="State">
              <select className="field" value={form.state || 'SA'} onChange={(e) => setForm({ ...form, state: e.target.value })}>
                {AU_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Postcode"><input className="field" value={form.postcode || ''} onChange={(e) => setForm({ ...form, postcode: e.target.value })} maxLength={4} /></Field>
          </div>

          <button type="submit" disabled={busy} className="btn-primary"><Save size={15} /> {busy ? 'Saving...' : 'Save details'}</button>
        </form>

        <aside className="rounded-2xl bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent orders</h2>
            <Link href="/account/orders/" className="text-xs font-semibold text-gold-600 hover:underline">See all</Link>
          </div>

          {list.length === 0 ? (
            <p className="mt-4 text-sm text-ink-400">You have not placed an order yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink-100">
              {list.slice(0, 4).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{o.orderNumber}</p>
                    <p className="text-xs text-ink-400">{formatDate(o.createdAt)} &middot; {o.items.length} items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{money(o.total)}</p>
                    <Badge tone={o.status}>{o.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

function Tile({ icon: Icon, label, value, href }) {
  const inner = (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-soft transition hover:shadow-lift">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-50 text-gold-600"><Icon size={19} /></span>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function Field({ label, children }) {
  return <div><span className="label">{label}</span>{children}</div>;
}
