import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import Img from '@/components/ui/Img';
import SectionHeading from '@/components/ui/SectionHeading';
import { formatDate } from '@/lib/format';

export default function BlogTeaser({ posts = [] }) {
  if (!posts.length) return null;
  return (
    <section className="container py-16 md:py-20">
      <SectionHeading
        align="left"
        eyebrow="The journal"
        title="Guides, care notes and workshop stories"
        action={<Link href="/blog/" className="btn-outline btn-sm w-fit">Read the journal <ArrowUpRight size={14} /></Link>}
      />

      <div className="mt-9 grid gap-5 md:grid-cols-3">
        {posts.slice(0, 3).map((post) => (
          <article key={post.id} className="group overflow-hidden rounded-2xl bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
            <Link href={`/blog/${post.slug}/`} className="block aspect-[16/10] overflow-hidden bg-cream-dark">
              <Img src={post.cover} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            </Link>
            <div className="space-y-2.5 p-5">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gold-600">
                {(post.tags || []).slice(0, 1).map((t) => <span key={t}>{t}</span>)}
                <span className="text-ink-300">&middot;</span>
                <span className="flex items-center gap-1 text-ink-400"><Clock size={11} /> {post.readTime} min</span>
              </div>
              <h3 className="text-lg font-semibold leading-snug">
                <Link href={`/blog/${post.slug}/`} className="transition hover:text-gold-600">{post.title}</Link>
              </h3>
              <p className="text-sm leading-relaxed text-ink-500">{post.excerpt}</p>
              <p className="pt-1 text-xs text-ink-400">{post.author} &middot; {formatDate(post.publishedAt)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
