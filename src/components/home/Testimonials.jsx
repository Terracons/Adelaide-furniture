'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import Rating from '@/components/ui/Rating';
import SectionHeading from '@/components/ui/SectionHeading';
import { initials } from '@/lib/format';

export default function Testimonials({ testimonials = [] }) {
  const [index, setIndex] = useState(0);
  if (!testimonials.length) return null;

  const perView = 3;
  const maxIndex = Math.max(0, testimonials.length - perView);
  const go = (dir) => setIndex((i) => Math.min(maxIndex, Math.max(0, i + dir)));

  return (
    <section className="bg-cream-dark/50 py-16 md:py-20">
      <div className="container">
        <SectionHeading
          align="left"
          eyebrow="Reviews"
          title="What people say once it's in the room"
          action={
            <div className="flex gap-2">
              <button onClick={() => go(-1)} disabled={index === 0} aria-label="Previous"
                className="grid h-10 w-10 place-items-center rounded-full border border-ink-200 transition hover:border-gold-500 hover:text-gold-600 disabled:opacity-30">
                <ChevronLeft size={17} />
              </button>
              <button onClick={() => go(1)} disabled={index >= maxIndex} aria-label="Next"
                className="grid h-10 w-10 place-items-center rounded-full border border-ink-200 transition hover:border-gold-500 hover:text-gold-600 disabled:opacity-30">
                <ChevronRight size={17} />
              </button>
            </div>
          }
        />

        <div className="mt-9 overflow-hidden">
          <div className="flex gap-5 transition-transform duration-500"
            style={{ transform: `translateX(calc(-${index} * (100% + 1.25rem) / ${perView}))` }}>
            {testimonials.map((t) => (
              <article key={t.id}
                className="flex w-full shrink-0 flex-col gap-4 rounded-2xl bg-white p-6 shadow-soft sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]">
                <Quote size={26} className="text-gold-300" />
                <p className="flex-1 text-[15px] leading-relaxed text-ink-600">&ldquo;{t.text}&rdquo;</p>
                <Rating value={t.rating} size={13} />
                <div className="flex items-center gap-3 border-t border-ink-100 pt-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-100 text-xs font-bold text-gold-700">
                    {initials(t.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{t.name}</p>
                    <p className="truncate text-[11px] text-ink-400">{t.location} &middot; {t.product}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
