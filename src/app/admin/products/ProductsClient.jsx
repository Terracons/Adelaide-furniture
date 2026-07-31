'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import DataTable from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import ProductForm from './ProductForm';
import Badge from '@/components/ui/Badge';
import Img from '@/components/ui/Img';
import { money } from '@/lib/format';
import { getAllProducts, getCategories, deleteProduct, saveProduct } from '@/lib/data';
import { useData } from '@/lib/hooks';
import { useToast } from '@/context/ToastContext';

export default function ProductsClient() {
  const { data: products, refresh } = useData(() => getAllProducts(), [], []);
  const { data: categories } = useData(() => getCategories(), [], []);
  const { toast } = useToast();
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  async function remove(id) {
    await deleteProduct(id);
    refresh();
    toast('Product deleted', 'info');
  }

  async function duplicate(p) {
    const copy = { ...p };
    delete copy.id;
    copy.name = `${p.name} (copy)`;
    copy.slug = `${p.slug}-copy-${Date.now().toString().slice(-4)}`;
    copy.status = 'draft';
    await saveProduct(copy);
    refresh();
    toast('Product duplicated as a draft');
  }

  const columns = [
    {
      key: 'name',
      label: 'Product',
      render: (p) => (
        <div className="flex items-center gap-3">
          <Img src={p.image} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-cream-dark object-cover" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{p.name}</p>
            <p className="text-xs text-ink-400">{p.sku}</p>
          </div>
        </div>
      )
    },
    { key: 'category', label: 'Category', render: (p) => <span className="capitalize text-ink-500">{p.category}</span> },
    { key: 'price', label: 'Price', align: 'right', render: (p) => <span className="font-semibold">{money(p.price)}</span> },
    {
      key: 'stock',
      label: 'Stock',
      align: 'right',
      render: (p) => (
        <span className={`font-semibold ${p.stock === 0 ? 'text-rose-600' : p.stock < 10 ? 'text-amber-600' : 'text-ink-600'}`}>
          {p.stock}
        </span>
      )
    },
    { key: 'status', label: 'Status', render: (p) => <Badge tone={p.status}>{p.status}</Badge> },
    {
      key: 'actions',
      label: '',
      sortable: false,
      align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Link href={`/product/${p.slug}/`} target="_blank" title="View on site"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-cream hover:text-gold-600">
            <ExternalLink size={15} />
          </Link>
          <button onClick={() => duplicate(p)} title="Duplicate"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-cream hover:text-gold-600">
            <Copy size={15} />
          </button>
          <button onClick={() => setEditing(p)} title="Edit"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-cream hover:text-gold-600">
            <Pencil size={15} />
          </button>
          <button onClick={() => setConfirm(p)} title="Delete"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600">
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminShell
      title="Products"
      subtitle={`${(products || []).length} pieces in the catalogue`}
      actions={<button onClick={() => setEditing({})} className="btn-primary btn-sm"><Plus size={14} /> New product</button>}
    >
      <DataTable
        columns={columns}
        rows={products || []}
        searchKeys={['name', 'sku', 'category']}
        perPage={10}
        empty="No products yet - add your first one."
      />

      {editing && (
        <ProductForm
          product={editing}
          categories={categories || []}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove(confirm.id)}
        title={`Delete ${confirm?.name}?`}
        body="This removes the product from the catalogue. Existing orders keep their record of it."
      />
    </AdminShell>
  );
}
