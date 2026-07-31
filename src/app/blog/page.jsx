import Link from 'next/link';
import { Clock, ArrowUpRight } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Img from '@/components/ui/Img';
import { formatDate } from '@/lib/format';
import { getPosts } from '@/lib/data';

export const metadata = {
  title: 'The journal',
  description: 'Buying guides, care notes and stories from the Adelaide Furniture workshop.'
};

export default async function BlogPage() {
  const posts = await getPosts();
  const [lead, ...rest] = posts;

  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ label: 'Journal' }]} />
      <h1 className="mt-3 text-3xl font-semibold md:text-[42px]">The journal</h1>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-500">
        Buying guides, care notes and the occasional story from the bench. Written by the people who
        make the furniture.
      </p>

      {lead && (
        <Link href={`/blog/${lead.slug}/`} className="group mt-9 grid overflow-hidden rounded-3xl bg-white shadow-soft transition hover:shadow-lift lg:grid-cols-2">
          <div className="aspect-[16/10] overflow-hidden bg-cream-dark lg:aspect-auto">
            <Img src={lead.cover} alt={lead.title} loading="eager" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          </div>
          <div className="flex flex-col justify-center gap-3 p-7 lg:p-10">
            <span className="eyebrow">Featured &middot; {(lead.tags || [])[0]}</span>
            <h2 className="text-2xl font-semibold leading-tight md:text-3xl">{lead.title}</h2>
            <p className="text-[15px] leading-relaxed text-ink-500">{lead.excerpt}</p>
            <p className="text-xs text-ink-400">{lead.author} &middot; {formatDate(lead.publishedAt, 'long')} &middot; {lead.readTime} min read</p>
            <span className="mt-1 flex w-fit items-center gap-1.5 text-sm font-semibold text-gold-600">
              Read the article <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <article key={post.id} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
            <Link href={`/blog/${post.slug}/`} className="aspect-[16/10] overflow-hidden bg-cream-dark">
              <Img src={post.cover} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            </Link>
            <div className="flex flex-1 flex-col gap-2.5 p-5">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gold-600">
                {(post.tags || []).slice(0, 1).map((t) => <span key={t}>{t}</span>)}
                <span className="text-ink-300">&middot;</span>
                <span className="flex items-center gap-1 text-ink-400"><Clock size={11} /> {post.readTime} min</span>
              </div>
              <h2 className="text-lg font-semibold leading-snug">
                <Link href={`/blog/${post.slug}/`} className="transition hover:text-gold-600">{post.title}</Link>
              </h2>
              <p className="text-sm leading-relaxed text-ink-500">{post.excerpt}</p>
              <p className="mt-auto pt-2 text-xs text-ink-400">{post.author} &middot; {formatDate(post.publishedAt)}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
