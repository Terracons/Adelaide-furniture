'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Img from '@/components/ui/Img';
import { slugify } from '@/lib/format';
import { getCategories, saveCategory, deleteCategory } from '@/lib/data';
import { useData } from '@/lib/hooks';
import { useToast } from '@/context/ToastContext';

const BLANK = { name: '', slug: '', description: '', image: '/images/categories/decor.svg', featured: false };

export default function CategoriesClient() {
  const { data: categories, refresh } = useData(() => getCategories(), [], []);
  const { toast } = useToast();
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  async function save(e) {
    e.preventDefault();
    if (!editing.name.trim()) return toast('Give the category a name', 'error');
    await saveCategory({ ...editing, slug: editing.slug || slugify(editing.name) });
    setEditing(null);
    refresh();
    toast('Category saved');
  }

  return (
    <AdminShell
      title="Categories"
      subtitle={`${(categories || []).length} collections`}
      actions={<button onClick={() => setEditing({ ...BLANK })} className="btn-primary btn-sm"><Plus size={14} /> New category</button>}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(categories || []).map((c) => (
          <div key={c.id} className="overflow-hidden rounded-2xl bg-white shadow-soft">
            <div className="aspect-[16/9] bg-cream-dark">
              <Img src={c.image} alt={c.name} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{c.name}</h3>
                  <p className="text-xs text-ink-400">/{c.slug} &middot; {c.count} products</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(c)} title="Edit"
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-cream hover:text-gold-600"><Pencil size={15} /></button>
                  <button onClick={() => setConfirm(c)} title="Delete"
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-500">{c.description}</p>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal open onClose={() => setEditing(null)} title={editing.id ? `Edit ${editing.name}` : 'New category'}
          footer={
            <>
              <button onClick={() => setEditing(null)} className="btn-ghost btn-sm">Cancel</button>
              <button onClick={save} className="btn-primary btn-sm">Save</button>
            </>
          }>
          <form onSubmit={save} className="space-y-4">
            <div>
              <span className="label">Name</span>
              <input className="field" value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} />
            </div>
            <div>
              <span className="label">Slug</span>
              <input className="field" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
            </div>
            <div>
              <span className="label">Description</span>
              <textarea rows={3} className="field resize-none" value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div>
              <span className="label">Image path</span>
              <div className="flex gap-3">
                <input className="field" value={editing.image || ''} onChange={(e) => setEditing({ ...editing, image: e.target.value })} />
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream-dark">
                  <Img src={editing.image} alt="" className="h-full w-full object-cover" />
                </div>
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                className="h-4 w-4 rounded accent-gold-500" />
              Show in the header menu
            </label>
          </form>
        </Modal>
      )}

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        onConfirm={async () => { await deleteCategory(confirm.id); refresh(); toast('Category deleted', 'info'); }}
        title={`Delete ${confirm?.name}?`} body="Products in this category will become uncategorised." />
    </AdminShell>
  );
}
