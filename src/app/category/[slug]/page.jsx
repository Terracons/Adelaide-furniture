import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ShopClient from '@/components/shop/ShopClient';
import Img from '@/components/ui/Img';
import { getCategories, getCategory, getFilterOptions, getProducts } from '@/lib/data';

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const category = await getCategory(params.slug);
  if (!category) return { title: 'Category not found' };
  return {
    title: category.name,
    description: category.description
  };
}

export default async function CategoryPage({ params }) {
  const category = await getCategory(params.slug);
  if (!category) notFound();

  const [categories, options, initial] = await Promise.all([
    getCategories(),
    getFilterOptions(),
    getProducts({ category: params.slug, perPage: 12 })
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink-100 bg-white">
        <div className="container grid items-center gap-8 py-10 md:grid-cols-2 md:py-14">
          <div>
            <Breadcrumbs items={[{ label: 'Shop', href: '/shop/' }, { label: category.name }]} />
            <h1 className="mt-3 text-3xl font-semibold md:text-[42px]">{category.name}</h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-500">{category.description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gold-600">
              {category.count} pieces in this collection
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl bg-cream-dark shadow-soft">
            <Img src={category.image} alt={category.name} className="aspect-[16/9] w-full object-cover" loading="eager" />
          </div>
        </div>
      </section>

      <div className="pt-8">
        <Suspense fallback={<div className="container py-20 text-center text-sm text-ink-400">Loading...</div>}>
          <ShopClient categories={categories} options={options} initialCategory={params.slug} initial={initial} />
        </Suspense>
      </div>
    </>
  );
}
