import ProductCard from './ProductCard';
import SectionHeading from '@/components/ui/SectionHeading';

export default function RelatedProducts({ products = [], title = 'You may also like', eyebrow = 'More to see' }) {
  if (!products.length) return null;
  return (
    <section className="border-t border-ink-100 pt-12">
      <SectionHeading align="left" eyebrow={eyebrow} title={title} />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
