import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Img from '@/components/ui/Img';
import SectionHeading from '@/components/ui/SectionHeading';

export default function CategoryStrip({ categories = [] }) {
  return (
    <section className="container py-16 md:py-20">
      <SectionHeading
        align="left"
        eyebrow="Shop by room"
        title="Everything for the rooms you use most"
        action={<Link href="/collections/" className="btn-outline btn-sm w-fit">All collections <ArrowUpRight size={14} /></Link>}
      />

      <div className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.slice(0, 8).map((c, i) => (
          <Link key={c.slug} href={`/category/${c.slug}/`}
            className={`group relative overflow-hidden rounded-2xl bg-cream-dark shadow-soft transition hover:shadow-lift ${
              i === 0 ? 'col-span-2 row-span-2 md:col-span-2' : ''
            }`}>
            <div className={i === 0 ? 'aspect-square md:aspect-[1/1]' : 'aspect-[4/3]'}>
              <Img src={c.image} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-400">{c.count} pieces</p>
              <h3 className="mt-0.5 flex items-center gap-1.5 text-base font-semibold text-cream md:text-lg">
                {c.name}
                <ArrowUpRight size={16} className="opacity-0 transition group-hover:opacity-100" />
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
