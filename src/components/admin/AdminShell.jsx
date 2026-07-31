'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Layers, Star, FileText,
  Ticket, Settings, LogOut, Menu, X, ExternalLink, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { initials } from '@/lib/format';

const NAV = [
  { label: 'Dashboard', href: '/admin/', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products/', icon: Package },
  { label: 'Orders', href: '/admin/orders/', icon: ShoppingCart },
  { label: 'Customers', href: '/admin/customers/', icon: Users },
  { label: 'Categories', href: '/admin/categories/', icon: Layers },
  { label: 'Reviews', href: '/admin/reviews/', icon: Star },
  { label: 'Blog', href: '/admin/blog/', icon: FileText },
  { label: 'Coupons', href: '/admin/coupons/', icon: Ticket },
  { label: 'Messages', href: '/admin/messages/', icon: MessageSquare },
  { label: 'Settings', href: '/admin/settings/', icon: Settings }
];

export default function AdminShell({ children, title, subtitle, actions }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, signOutAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (href) =>
    href === '/admin/' ? pathname === '/admin' || pathname === '/admin/' : pathname.startsWith(href.replace(/\/$/, ''));

  const sidebar = (
    <div className="flex h-full flex-col bg-ink text-cream/70">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-gold-500 text-sm font-bold text-ink">AF</span>
        <div className="leading-none">
          <p className="font-display text-base font-semibold text-cream">Adelaide</p>
          <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-gold-400">Admin panel</p>
        </div>
        <button onClick={() => setOpen(false)} className="ml-auto lg:hidden" aria-label="Close menu"><X size={19} /></button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive(item.href) ? 'bg-gold-500 text-ink shadow-gold' : 'hover:bg-white/5 hover:text-cream'
            }`}>
            <item.icon size={17} /> {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5 hover:text-cream">
          <ExternalLink size={17} /> View storefront
        </Link>
        <button onClick={() => { signOutAdmin(); router.push('/admin/login/'); }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5 hover:text-rose-300">
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">{sidebar}</div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-[120] lg:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
          <div className="relative h-full w-[min(80vw,280px)]">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-ink-100 bg-cream/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
            <button onClick={() => setOpen(true)} className="lg:hidden" aria-label="Open menu"><Menu size={21} /></button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1>
              {subtitle && <p className="truncate text-xs text-ink-400">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <span className="hidden items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-soft sm:flex">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gold-100 text-[10px] font-bold text-gold-700">
                  {initials(admin?.name || 'Admin')}
                </span>
                <span className="text-xs font-semibold">{admin?.name}</span>
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
