'use client';

import { useState } from 'react';
import { Check, X, Trash2 } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import DataTable from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';
import { formatDate } from '@/lib/format';
import { getReviews, updateReview, deleteReview } from '@/lib/data';
import { useData } from '@/lib/hooks';
import { useToast } from '@/context/ToastContext';

export default function ReviewsClient() {
  const { data: reviews, refresh } = useData(() => getReviews({ status: 'all' }), [], []);
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');
  const [confirm, setConfirm] = useState(null);

  const rows = (reviews || []).filter((r) => filter === 'all' || r.status === filter);
  const counts = (reviews || []).reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {});

  async function moderate(r, status) {
    await updateReview(r.id, { status });
    refresh();
    toast(status === 'approved' ? 'Review approved and published' : 'Review rejected');
  }

  const columns = [
    {
      key: 'author',
      label: 'Review',
      render: (r) => (
        <div className="min-w-0 max-w-md">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{r.author}</p>
            <Rating value={r.rating} size={11} />
          </div>
          {r.title && <p className="mt-0.5 text-xs font-medium text-ink-600">{r.title}</p>}
          <p className="mt-0.5 line-clamp-2 text-xs text-ink-400">{r.body}</p>
        </div>
      )
    },
    { key: 'productSlug', label: 'Product', render: (r) => <span className="text-xs text-ink-500">{r.productSlug}</span> },
    { key: 'createdAt', label: 'Date', render: (r) => <span className="text-xs text-ink-400">{formatDate(r.createdAt)}</span> },
    { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status}>{r.status}</Badge> },
    {
      key: 'actions',
      label: '',
      sortable: false,
      align: 'right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          {r.status !== 'approved' && (
            <button onClick={() => moderate(r, 'approved')} title="Approve"
              className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-emerald-50 hover:text-emerald-600"><Check size={16} /></button>
          )}
          {r.status !== 'rejected' && (
            <button onClick={() => moderate(r, 'rejected')} title="Reject"
              className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-amber-50 hover:text-amber-600"><X size={16} /></button>
          )}
          <button onClick={() => setConfirm(r)} title="Delete"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
        </div>
      )
    }
  ];

  return (
    <AdminShell title="Reviews" subtitle={`${counts.pending || 0} waiting for moderation`}>
      <div className="mb-4 flex flex-wrap gap-2">
        {['all', 'pending', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
              filter === s ? 'bg-ink text-cream' : 'bg-white text-ink-500 shadow-soft hover:text-gold-600'
            }`}>
            {s} {s !== 'all' && <span className="opacity-60">({counts[s] || 0})</span>}
          </button>
        ))}
      </div>

      <DataTable columns={columns} rows={rows} searchKeys={['author', 'title', 'body', 'productSlug']} perPage={10}
        empty="No reviews match this filter." />

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        onConfirm={async () => { await deleteReview(confirm.id); refresh(); toast('Review deleted', 'info'); }}
        title="Delete this review?" />
    </AdminShell>
  );
}
