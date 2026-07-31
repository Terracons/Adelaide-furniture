'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import DataTable from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Img from '@/components/ui/Img';
import { formatDate, slugify } from '@/lib/format';
import { getPosts, savePost, deletePost } from '@/lib/data';
import { useData } from '@/lib/hooks';
import { useToast } from '@/context/ToastContext';

const BLANK = {
  title: '', slug: '', excerpt: '', body: '<p></p>', cover: '/images/blog/post-1.svg',
  author: 'Adelaide Studio', role: '', tags: [], readTime: 5, status: 'published',
  publishedAt: new Date().toISOString().slice(0, 10), featured: false
};

export default function BlogAdminClient() {
  const { data: posts, refresh } = useData(() => getPosts({ status: 'all' }), [], []);
  const { toast } = useToast();
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  async function save(e) {
    e.preventDefault();
    if (!editing.title.trim()) return toast('Give the article a title', 'error');
    await savePost({ ...editing, slug: editing.slug || slugify(editing.title) });
    setEditing(null);
    refresh();
    toast('Article saved');
  }

  const columns = [
    {
      key: 'title',
      label: 'Article',
      render: (p) => (
        <div className="flex items-center gap-3">
          <Img src={p.cover} alt="" className="h-11 w-16 shrink-0 rounded-lg bg-cream-dark object-cover" />
          <div className="min-w-0 max-w-sm">
            <p className="truncate font-semibold">{p.title}</p>
            <p className="truncate text-xs text-ink-400">{p.excerpt}</p>
          </div>
        </div>
      )
    },
    { key: 'author', label: 'Author', render: (p) => <span className="text-ink-500">{p.author}</span> },
    { key: 'publishedAt', label: 'Published', render: (p) => <span className="text-xs text-ink-400">{formatDate(p.publishedAt)}</span> },
    { key: 'status', label: 'Status', render: (p) => <Badge tone={p.status || 'published'}>{p.status || 'published'}</Badge> },
    {
      key: 'actions',
      label: '',
      sortable: false,
      align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Link href={`/blog/${p.slug}/`} target="_blank" title="View"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-cream hover:text-gold-600"><ExternalLink size={15} /></Link>
          <button onClick={() => setEditing({ ...p, tags: p.tags || [] })} title="Edit"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-cream hover:text-gold-600"><Pencil size={15} /></button>
          <button onClick={() => setConfirm(p)} title="Delete"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
        </div>
      )
    }
  ];

  return (
    <AdminShell
      title="Journal"
      subtitle={`${(posts || []).length} articles`}
      actions={<button onClick={() => setEditing({ ...BLANK })} className="btn-primary btn-sm"><Plus size={14} /> New article</button>}
    >
      <DataTable columns={columns} rows={posts || []} searchKeys={['title', 'author', 'excerpt']} perPage={10}
        empty="No articles yet." />

      {editing && (
        <Modal open onClose={() => setEditing(null)} width="max-w-3xl" title={editing.id ? 'Edit article' : 'New article'}
          footer={
            <>
              <button onClick={() => setEditing(null)} className="btn-ghost btn-sm">Cancel</button>
              <button onClick={save} className="btn-primary btn-sm">Save article</button>
            </>
          }>
          <form onSubmit={save} className="space-y-4">
            <div>
              <span className="label">Title</span>
              <input className="field" value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><span className="label">Slug</span>
                <input className="field" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} /></div>
              <div><span className="label">Cover image path</span>
                <input className="field" value={editing.cover} onChange={(e) => setEditing({ ...editing, cover: e.target.value })} /></div>
            </div>
            <div>
              <span className="label">Excerpt</span>
              <textarea rows={2} className="field resize-none" value={editing.excerpt}
                onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
            </div>
            <div>
              <span className="label">Body (HTML)</span>
              <textarea rows={10} className="field resize-none font-mono text-xs" value={editing.body}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
              <p className="mt-1 text-[11px] text-ink-400">Use &lt;p&gt; for paragraphs and &lt;h2&gt; for section headings.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><span className="label">Author</span>
                <input className="field" value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} /></div>
              <div><span className="label">Read time (min)</span>
                <input type="number" className="field" value={editing.readTime} onChange={(e) => setEditing({ ...editing, readTime: Number(e.target.value) })} /></div>
              <div><span className="label">Published date</span>
                <input type="date" className="field" value={editing.publishedAt} onChange={(e) => setEditing({ ...editing, publishedAt: e.target.value })} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><span className="label">Tags (comma separated)</span>
                <input className="field" value={(editing.tags || []).join(', ')}
                  onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} /></div>
              <div><span className="label">Status</span>
                <select className="field" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select></div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                className="h-4 w-4 rounded accent-gold-500" />
              Feature on the journal index
            </label>
          </form>
        </Modal>
      )}

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        onConfirm={async () => { await deletePost(confirm.id); refresh(); toast('Article deleted', 'info'); }}
        title={`Delete "${confirm?.title}"?`} />
    </AdminShell>
  );
}
