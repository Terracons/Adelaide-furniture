import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, ArrowLeft } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Img from '@/components/ui/Img';
import { formatDate, initials } from '@/lib/format';
import { getPost, getPosts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Article not found' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: [post.cover], type: 'article' }
  };
}

export default async function BlogPostPage({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const all = await getPosts();
  const more = all.filter((p) => p.slug !== post.slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.cover,
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: post.author }
  };

  return (
    <article className="py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container max-w-3xl">
        <Breadcrumbs items={[{ label: 'Journal', href: '/blog/' }, { label: post.title }]} />

        <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gold-600">
          {(post.tags || []).map((t) => <span key={t} className="rounded-full bg-gold-50 px-2.5 py-1">{t}</span>)}
          <span className="flex items-center gap-1 text-ink-400"><Clock size={11} /> {post.readTime} min read</span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-[44px]">{post.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-500">{post.excerpt}</p>

        <div className="mt-6 flex items-center gap-3 border-y border-ink-100 py-4">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-100 text-sm font-bold text-gold-700">
            {initials(post.author)}
          </span>
          <div>
            <p className="text-sm font-semibold">{post.author}</p>
            <p className="text-xs text-ink-400">{post.role || 'Adelaide Furniture'} &middot; {formatDate(post.publishedAt, 'long')}</p>
          </div>
        </div>
      </div>

      <div className="container mt-8 max-w-4xl">
        <div className="overflow-hidden rounded-3xl bg-cream-dark shadow-soft">
          <Img src={post.cover} alt={post.title} loading="eager" className="aspect-[16/9] w-full object-cover" />
        </div>
      </div>

      <div className="container mt-10 max-w-3xl">
        <div
          className="space-y-5 [&_h2]:mt-9 [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:text-[16px] [&_p]:leading-[1.75] [&_p]:text-ink-600 [&_strong]:font-semibold [&_strong]:text-ink"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        <div className="mt-12 rounded-2xl bg-ink p-7 text-cream">
          <p className="text-sm text-cream/60">Written in the workshop at 118 Rundle Street, Adelaide.</p>
          <Link href="/shop/" className="btn-primary mt-4">Browse the collection</Link>
        </div>

        <Link href="/blog/" className="btn-ghost btn-sm mt-8"><ArrowLeft size={15} /> All articles</Link>
      </div>

      {more.length > 0 && (
        <div className="container mt-16">
          <h2 className="text-2xl font-semibold">Keep reading</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {more.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}/`} className="group overflow-hidden rounded-2xl bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
                <div className="aspect-[16/10] overflow-hidden bg-cream-dark">
                  <Img src={p.cover} alt={p.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold leading-snug transition group-hover:text-gold-600">{p.title}</h3>
                  <p className="mt-2 text-xs text-ink-400">{p.author} &middot; {formatDate(p.publishedAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
