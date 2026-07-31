import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import Img from '@/components/ui/Img';

const POINTS = [
  'Kiln-dried hardwood frames, corner-blocked and dowelled',
  'Mortise-and-tenon joinery on every seat rail',
  'Low-VOC hardwax oils that let the grain keep breathing',
  'Timber sourced from mills we can name'
];

export default function CraftStory() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container grid items-center gap-12 lg:grid-cols-2">
        <div className="relative">
          <div className="overflow-hidden rounded-3xl bg-cream-dark shadow-lift">
            <Img src="/images/hero/dining.svg" alt="Inside the Adelaide workshop" className="h-full w-full object-cover" />
          </div>
          <div className="absolute -right-2 bottom-6 w-44 rounded-2xl bg-ink p-4 text-cream shadow-lift sm:right-6">
            <p className="font-display text-3xl font-semibold text-gold-400">9 hrs</p>
            <p className="mt-1 text-[11px] leading-snug text-cream/60">of hand work in a single dining chair, spread across six weeks</p>
          </div>
        </div>

        <div>
          <span className="eyebrow"><span className="h-px w-6 bg-gold-500" /> Our workshop</span>
          <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
            Nothing leaves the bench until it would pass in our own homes
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-500">
            We started in 2011 in a two-person shed on Rundle Street, making chairs for a restaurant
            that could not find any it liked. Fifteen years on, the team is twenty-four people and the
            standard has not moved: cut it properly, finish it slowly, stand behind it for a decade.
          </p>

          <ul className="mt-6 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-ink-600">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold-100 text-gold-700">
                  <Check size={12} strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <Link href="/about/" className="btn-dark mt-8">Read our story <ArrowRight size={15} /></Link>
        </div>
      </div>
    </section>
  );
}
