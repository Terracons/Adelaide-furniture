'use client';

import { useState } from 'react';
import { MessageSquarePlus, Star } from 'lucide-react';
import Rating from '@/components/ui/Rating';
import Modal from '@/components/ui/Modal';
import { formatDate, initials } from '@/lib/format';
import { addReview, getReviews } from '@/lib/data';
import { useData } from '@/lib/hooks';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

export default function Reviews({ product, initialReviews = [] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ author: '', email: '', rating: 5, title: '', body: '' });
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: reviews, refresh } = useData(
    () => getReviews({ productId: product.id }),
    [product.id],
    initialReviews
  );

  const list = reviews || [];
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: list.filter((r) => r.rating === star).length
  }));
  const average = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : product.rating;

  async function submit(e) {
    e.preventDefault();
    if (!form.author.trim() || !form.body.trim()) return toast('Please add your name and a comment', 'error');
    setBusy(true);
    await addReview({ ...form, productId: product.id, productSlug: product.slug, userId: user?.id || null });
    setBusy(false);
    setOpen(false);
    setForm({ author: '', email: '', rating: 5, title: '', body: '' });
    refresh();
    toast('Thanks - your review is queued for moderation');
  }

  return (
    <section id="reviews" className="border-t border-ink-100 pt-12">
      <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
        <div>
          <h2 className="text-2xl font-semibold">Customer reviews</h2>
          <div className="mt-4 flex items-end gap-3">
            <span className="font-display text-5xl font-semibold">{average.toFixed(1)}</span>
            <div className="pb-1.5">
              <Rating value={average} size={15} />
              <p className="mt-1 text-xs text-ink-400">Based on {list.length} reviews</p>
            </div>
          </div>

          <div className="mt-5 space-y-1.5">
            {breakdown.map((b) => (
              <div key={b.star} className="flex items-center gap-2 text-xs">
                <span className="flex w-8 items-center gap-0.5 text-ink-500">{b.star}<Star size={10} className="fill-gold-500 text-gold-500" /></span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-gold-500" style={{ width: `${list.length ? (b.count / list.length) * 100 : 0}%` }} />
                </div>
                <span className="w-6 text-right text-ink-400">{b.count}</span>
              </div>
            ))}
          </div>

          <button onClick={() => setOpen(true)} className="btn-outline btn-sm mt-6 w-full">
            <MessageSquarePlus size={15} /> Write a review
          </button>
        </div>

        <div>
          {list.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-ink-200 px-6 py-12 text-center text-sm text-ink-400">
              No reviews for this piece yet. Yours would be the first.
            </p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {list.map((r) => (
                <li key={r.id} className="flex gap-4 py-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-100 text-xs font-bold text-gold-700">
                    {initials(r.author)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{r.author}</p>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Verified buyer</span>
                      <span className="ml-auto text-xs text-ink-400">{formatDate(r.createdAt)}</span>
                    </div>
                    <Rating value={r.rating} size={12} className="mt-1.5" />
                    {r.title && <p className="mt-2 text-sm font-semibold">{r.title}</p>}
                    <p className="mt-1 text-sm leading-relaxed text-ink-500">{r.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`Review ${product.name}`}
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-ghost btn-sm">Cancel</button>
            <button onClick={submit} disabled={busy} className="btn-primary btn-sm">{busy ? 'Sending...' : 'Submit review'}</button>
          </>
        }>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <span className="label">Your rating</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} aria-label={`${n} stars`}>
                  <Star size={26} className={n <= form.rating ? 'fill-gold-500 text-gold-500' : 'fill-ink-100 text-ink-200'} />
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="rv-name">Name</label>
              <input id="rv-name" className="field" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
            </div>
            <div>
              <label className="label" htmlFor="rv-email">Email</label>
              <input id="rv-email" type="email" className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="rv-title">Headline</label>
            <input id="rv-title" className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sums up your experience" />
          </div>
          <div>
            <label className="label" htmlFor="rv-body">Your review</label>
            <textarea id="rv-body" rows={4} className="field resize-none" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
          </div>
        </form>
      </Modal>
    </section>
  );
}
