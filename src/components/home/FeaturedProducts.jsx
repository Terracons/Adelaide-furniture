'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import SectionHeading from '@/components/ui/SectionHeading';

const TABS = [
  { key: 'featured', label: 'Featured' },
  { key: 'isNew', label: 'New arrivals' },
  { key: 'bestseller', label: 'Best sellers' }
];

export default function FeaturedProducts({ products = [] }) {
  const [tab, setTab] = useState('featured');

  const visible = useMemo(
    () => products.filter((p) => p[tab]).slice(0, 8),
    [products, tab]
  );

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container">
        <SectionHeading
          align="left"
          eyebrow="The collection"
          title="Pieces our customers keep coming back for"
          action={
            <div className="flex flex-wrap items-center gap-2">
              {TABS.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    tab === t.key ? 'bg-ink text-cream' : 'border border-ink-200 text-ink-500 hover:border-gold-500 hover:text-gold-600'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          }
        />

        <div className="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {visible.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        <div className="mt-10 text-center">
          <Link href="/shop/" className="btn-outline">
            View all {products.length} pieces <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
