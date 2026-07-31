import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Img from '@/components/ui/Img';
import ProductCard from '@/components/product/ProductCard';
import SectionHeading from '@/components/ui/SectionHeading';
import { getCategories, getProducts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Collections',
  description: 'Browse Adelaide Furniture by room: living, dining, bedroom, lighting, storage, decor and outdoor.'
};

export default async function CollectionsPage() {
  const categories = await getCategories();
  const { items: featured } = await getProducts({ featured: true, perPage: 4 });

  return (
    <>
      <section className="border-b border-ink-100 bg-white">
        <div className="container py-8 md:py-12">
          <Breadcrumbs items={[{ label: 'Collections' }]} />
          <h1 className="mt-3 text-3xl font-semibold md:text-[42px]">Collections</h1>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-500">
            Every collection is designed to work together, same timbers, same finishes, same
            proportions, so you can furnish a room over years rather than in one weekend.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid gap-5 md:grid-cols-2">
          {categories.map((c, i) => (
            <Link key={c.slug} href={`/category/${c.slug}/`}
              className={`group relative overflow-hidden rounded-3xl bg-cream-dark shadow-soft transition hover:shadow-lift ${i % 3 === 0 ? 'md:col-span-2' : ''}`}>
              <div className={i % 3 === 0 ? 'aspect-[21/9]' : 'aspect-[4/3]'}>
                <Img src={c.image} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/90 via-ink/25 to-transparent p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">{c.count} pieces</p>
                <h2 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-cream">
                  {c.name} <ArrowUpRight size={20} className="transition group-hover:translate-x-1" />
                </h2>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-cream/65">{c.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container">
          <SectionHeading align="left" eyebrow="Editor's picks" title="Start with these" />
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>
    </>
  );
}
