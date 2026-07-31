'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Star, Play } from 'lucide-react';
import Img from '@/components/ui/Img';

const SLIDES = [
  {
    eyebrow: 'New season, 2026',
    title: 'Furniture built to outlast the trend',
    copy: 'Solid timber frames, natural fabrics and joinery cut by hand in our Adelaide workshop. Made once, properly.',
    image: '/images/hero/living.svg',
    cta: { label: 'Shop the collection', href: '/shop/' },
    alt: { label: 'Our story', href: '/about/' }
  },
  {
    eyebrow: 'Bedroom',
    title: 'A quieter room starts with the bed',
    copy: 'Upholstered frames with headboards tall enough to read against, on slatted hardwood bases that never creak.',
    image: '/images/hero/bedroom.svg',
    cta: { label: 'Shop bedroom', href: '/category/beds/' },
    alt: { label: 'View lighting', href: '/category/lighting/' }
  },
  {
    eyebrow: 'Dining',
    title: 'Tables for the long lunches',
    copy: 'European oak, brass inlay, and enough room for everyone who turns up unannounced.',
    image: '/images/hero/dining.svg',
    cta: { label: 'Shop dining', href: '/category/tables/' },
    alt: { label: 'See chairs', href: '/category/chairs/' }
  }
];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="pointer-events-none absolute -right-40 top-1/4 h-[520px] w-[520px] rounded-full bg-gold-100/60 blur-3xl" />
      <div className="container relative grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
        <div key={index} className="animate-fade-up">
          <span className="eyebrow">
            <span className="h-px w-6 bg-gold-500" />
            {slide.eyebrow}
          </span>
          <h1 className="mt-4 text-[38px] font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[58px]">
            {slide.title}
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-500">{slide.copy}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={slide.cta.href} className="btn-primary">
              {slide.cta.label} <ArrowRight size={16} />
            </Link>
            <Link href={slide.alt.href} className="btn-ghost">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-gold-500 text-gold-600">
                <Play size={12} className="fill-current" />
              </span>
              {slide.alt.label}
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-ink-100 pt-6">
            <Stat value="15+" label="Years in the workshop" />
            <Stat value="12k" label="Pieces delivered" />
            <div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={13} className="fill-gold-500 text-gold-500" />)}
              </div>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-ink-400">4.8 from 2,400 reviews</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[28px] bg-cream-dark shadow-lift">
            <Img key={slide.image} src={slide.image} alt={slide.title} loading="eager"
              className="h-full w-full animate-fade-in object-cover" />
          </div>

          <div className="absolute -bottom-4 left-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lift sm:left-8">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gold-500 text-sm font-bold text-white">10</div>
            <div>
              <p className="text-sm font-semibold leading-tight">Year frame warranty</p>
              <p className="text-[11px] text-ink-400">On every joint we cut</p>
            </div>
          </div>

          <div className="absolute right-4 top-4 flex gap-1.5">
            {SLIDES.map((s, i) => (
              <button key={s.image} onClick={() => setIndex(i)} aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-7 bg-gold-500' : 'w-1.5 bg-white/70 hover:bg-white'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wider text-ink-400">{label}</p>
    </div>
  );
}
