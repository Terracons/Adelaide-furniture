'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone, Clock, ArrowRight, ShieldCheck, Truck, Undo2, Hammer } from 'lucide-react';
import { subscribeEmail, getCategories, getSettings } from '@/lib/data';
import { useData } from '@/lib/hooks';
import { useToast } from '@/context/ToastContext';

const SHOP_LINKS = [
  { label: 'All furniture', href: '/shop/' },
  { label: 'Collections', href: '/collections/' },
  { label: 'New arrivals', href: '/shop/?sort=newest' },
  { label: 'Best sellers', href: '/shop/?sort=rating' },
  { label: 'Wishlist', href: '/wishlist/' }
];

const HELP_LINKS = [
  { label: 'Contact us', href: '/contact/' },
  { label: 'FAQs', href: '/faq/' },
  { label: 'Delivery & returns', href: '/faq/' },
  { label: 'Track an order', href: '/account/orders/' },
  { label: 'Admin panel', href: '/admin/' }
];

const COMPANY_LINKS = [
  { label: 'Our story', href: '/about/' },
  { label: 'The journal', href: '/blog/' },
  { label: 'Showroom', href: '/contact/' },
  { label: 'Trade & design', href: '/contact/' }
];

const PROMISES = [
  { icon: Truck, title: 'Two-person delivery', copy: 'Into the room, unpacked, packaging taken away.' },
  { icon: Undo2, title: '30-day home trial', copy: "If it doesn't suit the room, we collect it." },
  { icon: ShieldCheck, title: '10-year warranty', copy: 'On every frame and joint we cut.' },
  { icon: Hammer, title: 'Made in Adelaide', copy: 'Cut, sanded and finished by our own team.' }
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const { data: categories } = useData(() => getCategories(), [], []);
  const { data: settings } = useData(() => getSettings(), [], null);

  async function submit(e) {
    e.preventDefault();
    if (!email.includes('@')) return toast('Please enter a valid email address', 'error');
    setBusy(true);
    const res = await subscribeEmail(email);
    setBusy(false);
    setEmail('');
    toast(res.message);
  }

  return (
    <footer className="mt-20 bg-ink text-cream/85">
      {/* promises */}
      <div className="border-b border-white/10">
        <div className="container grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p) => (
            <div key={p.title} className="flex gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/5 text-gold-400">
                <p.icon size={19} />
              </div>
              <div>
                <p className="text-sm font-semibold text-cream">{p.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-cream/50">{p.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="flex w-fit items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-gold-500 text-sm font-bold text-ink">AF</span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-semibold text-cream">Adelaide</span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gold-400">Furniture</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/55">
            {settings?.description}
          </p>

          <form onSubmit={submit} className="mt-6 max-w-sm">
            <label className="label text-cream/50">Join the list</label>
            <div className="flex gap-2">
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" aria-label="Email address"
                className="flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold-500"
              />
              <button type="submit" disabled={busy} aria-label="Subscribe"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-500 text-ink transition hover:bg-gold-400 disabled:opacity-50">
                <ArrowRight size={17} />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-cream/35">New pieces and workshop notes. About once a month.</p>
          </form>

          <div className="mt-6 flex gap-2">
            {[[Instagram, settings?.social?.instagram], [Facebook, settings?.social?.facebook], [Youtube, settings?.social?.youtube]].map(([Icon, href], i) => (
              <a key={i} href={href || '#'} target="_blank" rel="noreferrer noopener" aria-label="Social link"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-cream/60 transition hover:border-gold-500 hover:text-gold-400">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <FooterColumn title="Shop" links={SHOP_LINKS} />
        <FooterColumn title="Rooms" links={(categories || []).slice(0, 6).map((c) => ({ label: c.name, href: `/category/${c.slug}/` }))} />
        <div>
          <FooterColumn title="Help" links={HELP_LINKS} />
          <div className="mt-7">
            <FooterColumn title="Company" links={COMPANY_LINKS} />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container grid gap-4 py-6 text-xs text-cream/50 sm:grid-cols-3">
          <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-gold-500" /> {settings?.address}</p>
          <p className="flex items-start gap-2"><Phone size={14} className="mt-0.5 shrink-0 text-gold-500" /> {settings?.phone}<span className="mx-1">/</span><Mail size={14} className="mt-0.5 shrink-0 text-gold-500" /> {settings?.email}</p>
          <p className="flex items-start gap-2"><Clock size={14} className="mt-0.5 shrink-0 text-gold-500" /> {settings?.hours}</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-[11px] text-cream/40 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Adelaide Furniture. ABN {settings?.abn}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/faq/" className="hover:text-gold-400">Privacy</Link>
            <Link href="/faq/" className="hover:text-gold-400">Terms</Link>
            <Link href="/admin/" className="hover:text-gold-400">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm text-cream/55 transition hover:text-gold-400">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
