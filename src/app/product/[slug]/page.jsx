import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Gallery from '@/components/product/Gallery';
import ProductPanel from '@/components/product/ProductPanel';
import Reviews from '@/components/product/Reviews';
import RelatedProducts from '@/components/product/RelatedProducts';
import { getAllProducts, getProduct, getRelatedProducts, getReviews } from '@/lib/data';

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [product.image]
    }
  };
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(product, 4),
    getReviews({ productId: product.id })
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.gallery,
    description: product.shortDescription,
    sku: product.sku,
    brand: { '@type': 'Brand', name: 'Adelaide Furniture' },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'AUD',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  };

  return (
    <div className="container py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumbs
        items={[
          { label: 'Shop', href: '/shop/' },
          { label: product.category, href: `/category/${product.category}/` },
          { label: product.name }
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <Gallery images={product.gallery} alt={product.name} />
        <ProductPanel product={product} />
      </div>

      <div className="mt-16 space-y-16">
        <Reviews product={product} initialReviews={reviews} />
        <RelatedProducts products={related} />
      </div>
    </div>
  );
}
