'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, User, X, ChevronDown, Phone } from 'lucide-react';
import AnnouncementBar from './AnnouncementBar';
import SearchOverlay from './SearchOverlay';
import CartDrawer from './CartDrawer';
import Img from '@/components/ui/Img';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useData, useScrollLock } from '@/lib/hooks';
import { getCategories, getSettings } from '@/lib/data';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop/', mega: true },
  { label: 'Collections', href: '/collections/' },
  { label: 'About', href: '/about/' },
  { label: 'Journal', href: '/blog/' },
  { label: 'Contact', href: '/contact/' }
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const pathname = usePathname();
  const { count, setDrawerOpen } = useCart();
  const { count: wishCount } = useWishlist();
  const { user } = useAuth();
  const { data: categories } = useData(() => getCategories(), [], []);
  const { data: settings } = useData(() => getSettings(), [], null);
  useScrollLock(menuOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href.replace(/\/$/, '')));

  return (
    <>
      <AnnouncementBar messages={settings?.announcements || []} />

      <header className={`sticky top-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-cream/95 shadow-soft backdrop-blur-md' : 'bg-cream'}`}>
        <div className="container flex h-16 items-center justify-between gap-4 md:h-20">
          <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="-ml-2 p-2 lg:hidden">
            <Menu size={22} />
          </button>

          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-sm font-bold text-gold-400 md:h-10 md:w-10">AF</span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-[17px] font-semibold tracking-tight md:text-[19px]">Adelaide</span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gold-600">Furniture</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <div key={item.href} className="relative"
                onMouseEnter={() => item.mega && setMegaOpen(true)}
                onMouseLeave={() => item.mega && setMegaOpen(false)}>
                <Link href={item.href}
                  className={`flex items-center gap-1 py-6 text-[13px] font-semibold uppercase tracking-wide transition ${
                    isActive(item.href) ? 'text-gold-600' : 'text-ink hover:text-gold-600'
                  }`}>
                  {item.label}
                  {item.mega && <ChevronDown size={13} className={`transition ${megaOpen ? 'rotate-180' : ''}`} />}
                </Link>

                {item.mega && megaOpen && (
                  <div className="absolute left-1/2 top-full w-[720px] -translate-x-1/2 animate-fade-up pt-1">
                    <div className="grid grid-cols-4 gap-1 rounded-2xl border border-ink-100 bg-white p-4 shadow-lift">
                      {(categories || []).map((c) => (
                        <Link key={c.slug} href={`/category/${c.slug}/`}
                          className="group flex flex-col gap-2 rounded-xl p-2.5 transition hover:bg-cream">
                          <div className="aspect-[4/3] overflow-hidden rounded-lg bg-cream-dark">
                            <Img src={c.image} alt={c.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold leading-tight">{c.name}</p>
                            <p className="text-[11px] text-ink-400">{c.count} pieces</p>
                          </div>
                        </Link>
                      ))}
                      <div className="col-span-4 mt-1 flex items-center justify-between rounded-xl bg-ink px-4 py-3 text-cream">
                        <p className="text-xs">Free two-person delivery on orders over $2,000</p>
                        <Link href="/shop/" className="text-xs font-bold text-gold-400 link-underline">Shop everything</Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <a href={`tel:${(settings?.phone || '').replace(/\s/g, '')}`} className="hidden items-center gap-1.5 px-3 text-xs font-semibold text-ink-500 transition hover:text-gold-600 xl:flex">
              <Phone size={14} /> {settings?.phone}
            </a>
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-ink-100">
              <Search size={19} />
            </button>
            <Link href="/wishlist/" aria-label="Wishlist" className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-ink-100">
              <Heart size={19} />
              {wishCount > 0 && <Badge>{wishCount}</Badge>}
            </Link>
            <Link href={user ? '/account/' : '/account/login/'} aria-label="Account" className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-ink-100">
              <User size={19} />
            </Link>
            <button onClick={() => setDrawerOpen(true)} aria-label="Open cart" className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-ink-100">
              <ShoppingBag size={19} />
              {count > 0 && <Badge>{count}</Badge>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[110] lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink/60" onClick={() => setMenuOpen(false)} />
          <nav className="relative flex h-full w-[min(86vw,340px)] animate-fade-in flex-col bg-cream">
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <span className="font-display text-lg font-semibold">Menu</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="p-1.5"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href}
                  className={`block border-b border-ink-100/70 py-3.5 text-[15px] font-semibold ${isActive(item.href) ? 'text-gold-600' : 'text-ink'}`}>
                  {item.label}
                </Link>
              ))}
              <p className="label mt-6">Shop by room</p>
              <div className="grid grid-cols-2 gap-2">
                {(categories || []).map((c) => (
                  <Link key={c.slug} href={`/category/${c.slug}/`}
                    className="rounded-lg border border-ink-100 bg-white px-3 py-2 text-xs font-medium">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="border-t border-ink-100 px-5 py-4">
              <Link href={user ? '/account/' : '/account/login/'} className="btn-dark w-full">
                <User size={16} /> {user ? user.name.split(' ')[0] : 'Sign in'}
              </Link>
              <a href={`tel:${(settings?.phone || '').replace(/\s/g, '')}`} className="mt-3 flex items-center justify-center gap-2 text-xs text-ink-500">
                <Phone size={13} /> {settings?.phone}
              </a>
            </div>
          </nav>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
    </>
  );
}

function Badge({ children }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-white">
      {children}
    </span>
  );
}
