'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Img from '@/components/ui/Img';

function useCountdown(targetDays = 6) {
  const [target] = useState(() => Date.now() + targetDays * 86400000);
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60)
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [target]);

  return left;
}

export default function PromoBanner() {
  const { d, h, m, s } = useCountdown(6);
  const units = [['Days', d], ['Hrs', h], ['Min', m], ['Sec', s]];

  return (
    <section className="container py-16 md:py-20">
      <div className="relative grid overflow-hidden rounded-3xl bg-ink lg:grid-cols-2">
        <div className="relative z-10 flex flex-col justify-center gap-5 p-8 sm:p-12 lg:p-14">
          <span className="eyebrow text-gold-400">
            <span className="h-px w-6 bg-gold-500" /> Winter workshop sale
          </span>
          <h2 className="text-3xl font-semibold leading-tight text-cream sm:text-4xl lg:text-[42px]">
            Up to <span className="gold-text">25% off</span> selected upholstery
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-cream/60">
            We run one sale a year, when the workshop has spare capacity between commissions.
            Use code <strong className="font-mono text-gold-400">GOLD500</strong> for $500 off orders over $3,000.
          </p>

          <div className="flex gap-2.5">
            {units.map(([label, value]) => (
              <div key={label} className="w-16 rounded-xl border border-white/10 bg-white/5 py-2.5 text-center">
                <p className="font-display text-xl font-semibold text-gold-400">{String(value).padStart(2, '0')}</p>
                <p className="text-[10px] uppercase tracking-wider text-cream/40">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/shop/?sort=price-desc" className="btn-primary">Shop the sale <ArrowRight size={15} /></Link>
            <Link href="/collections/" className="btn inline-flex border border-white/20 text-cream hover:border-gold-500 hover:text-gold-400">
              Browse collections
            </Link>
          </div>
        </div>

        <div className="relative min-h-[280px] lg:min-h-full">
          <Img src="/images/hero/banner-dark.svg" alt="Winter sale" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/50 to-transparent lg:from-ink lg:via-ink/20" />
        </div>
      </div>
    </section>
  );
}
