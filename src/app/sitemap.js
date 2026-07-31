import { getAllProducts, getCategories, getPosts } from '@/lib/data';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://adelaidefurniture.com.au';

export default async function sitemap() {
  const [products, categories, posts] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getPosts()
  ]);

  const staticRoutes = ['', '/shop', '/collections', '/about', '/blog', '/contact', '/faq', '/wishlist'].map((path) => ({
    url: `${BASE}${path}/`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.8
  }));

  return [
    ...staticRoutes,
    ...categories.map((c) => ({ url: `${BASE}/category/${c.slug}/`, changeFrequency: 'weekly', priority: 0.8 })),
    ...products.map((p) => ({ url: `${BASE}/product/${p.slug}/`, changeFrequency: 'weekly', priority: 0.7 })),
    ...posts.map((p) => ({ url: `${BASE}/blog/${p.slug}/`, lastModified: p.publishedAt, priority: 0.6 }))
  ];
}
