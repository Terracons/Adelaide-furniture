import { Suspense } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ShopClient from '@/components/shop/ShopClient';
import { getCategories, getFilterOptions, getProducts } from '@/lib/data';

export const metadata = {
  title: 'Shop all furniture',
  description: 'Browse the full Adelaide Furniture catalogue - sofas, chairs, tables, beds, lighting, storage and decor, all made in our Adelaide workshop.'
};

export default async function ShopPage() {
  const [categories, options, initial] = await Promise.all([
    getCategories(),
    getFilterOptions(),
    getProducts({ perPage: 12 })
  ]);

  return (
    <>
      <section className="border-b border-ink-100 bg-white">
        <div className="container py-8 md:py-12">
          <Breadcrumbs items={[{ label: 'Shop' }]} />
          <h1 className="mt-3 text-3xl font-semibold md:text-[42px]">The collection</h1>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-500">
            {initial.total} pieces, all made to order in Adelaide. Filter by room, finish or budget -
            and remember everything comes with a 30-day at-home trial.
          </p>
        </div>
      </section>

      <div className="pt-8">
        <Suspense fallback={<div className="container py-20 text-center text-sm text-ink-400">Loading the catalogue...</div>}>
          <ShopClient categories={categories} options={options} initial={initial} />
        </Suspense>
      </div>
    </>
  );
}
