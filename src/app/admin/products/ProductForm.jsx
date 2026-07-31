'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Img from '@/components/ui/Img';
import { saveProduct } from '@/lib/data';
import { slugify } from '@/lib/format';
import { useToast } from '@/context/ToastContext';

const BLANK = {
  name: '', slug: '', sku: '', category: 'sofas', price: '', comparePrice: '', stock: 0,
  shortDescription: '', description: '', colors: '', materials: '', dimensions: '', weight: '',
  image: '', gallery: [], status: 'published', featured: false, isNew: false, bestseller: false,
  rating: 4.5, reviewCount: 0
};

export default function ProductForm({ product, categories, onClose, onSaved }) {
  const isEdit = !!product?.id;
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(() => ({
    ...BLANK,
    ...product,
    colors: Array.isArray(product?.colors) ? product.colors.join(', ') : product?.colors || '',
    comparePrice: product?.comparePrice ?? '',
    gallery: product?.gallery || []
  }));

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast('Give the product a name', 'error');
    if (!form.price) return toast('Set a price', 'error');

    setBusy(true);
    const image = form.image || '/images/products/sena-ribbed-vase-1.svg';
    await saveProduct({
      ...form,
      slug: form.slug || slugify(form.name),
      sku: form.sku || `ADL-${Date.now().toString().slice(-5)}`,
      image,
      gallery: form.gallery?.length ? form.gallery : [image],
      comparePrice: form.comparePrice === '' ? null : Number(form.comparePrice)
    });
    setBusy(false);
    toast(isEdit ? 'Product updated' : 'Product created');
    onSaved();
  }

  return (
    <Modal
      open
      onClose={onClose}
      width="max-w-3xl"
      title={isEdit ? `Edit ${product.name}` : 'New product'}
      footer={
        <>
          <button onClick={onClose} className="btn-ghost btn-sm">Cancel</button>
          <button onClick={submit} disabled={busy} className="btn-primary btn-sm">{busy ? 'Saving...' : 'Save product'}</button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product name *">
            <input className="field" value={form.name}
              onChange={(e) => set({ name: e.target.value, slug: isEdit ? form.slug : slugify(e.target.value) })} />
          </Field>
          <Field label="URL slug" hint="Used in the web address">
            <input className="field" value={form.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="SKU"><input className="field" value={form.sku} onChange={(e) => set({ sku: e.target.value })} /></Field>
          <Field label="Category">
            <select className="field" value={form.category} onChange={(e) => set({ category: e.target.value })}>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className="field" value={form.status} onChange={(e) => set({ status: e.target.value })}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price (AUD) *"><input type="number" step="0.01" className="field" value={form.price} onChange={(e) => set({ price: e.target.value })} /></Field>
          <Field label="Compare-at price" hint="Shows as a strikethrough">
            <input type="number" step="0.01" className="field" value={form.comparePrice} onChange={(e) => set({ comparePrice: e.target.value })} />
          </Field>
          <Field label="Stock"><input type="number" className="field" value={form.stock} onChange={(e) => set({ stock: e.target.value })} /></Field>
        </div>

        <Field label="Short description" hint="One line, shown on cards and quick view">
          <input className="field" value={form.shortDescription} onChange={(e) => set({ shortDescription: e.target.value })} />
        </Field>

        <Field label="Full description" hint="Basic HTML is allowed (<p>, <strong>, <h2>)">
          <textarea rows={5} className="field resize-none font-mono text-xs" value={form.description}
            onChange={(e) => set({ description: e.target.value })} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Finishes" hint="Comma separated, e.g. Oak, Walnut, Black">
            <input className="field" value={form.colors} onChange={(e) => set({ colors: e.target.value })} />
          </Field>
          <Field label="Materials"><input className="field" value={form.materials} onChange={(e) => set({ materials: e.target.value })} /></Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Dimensions"><input className="field" value={form.dimensions} onChange={(e) => set({ dimensions: e.target.value })} /></Field>
          <Field label="Weight"><input className="field" value={form.weight} onChange={(e) => set({ weight: e.target.value })} /></Field>
        </div>

        <Field label="Main image path" hint="A file in /public/images/products, or any full URL">
          <div className="flex gap-3">
            <input className="field" value={form.image} onChange={(e) => set({ image: e.target.value })}
              placeholder="/images/products/my-photo.jpg" />
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream-dark">
              <Img src={form.image} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        </Field>

        <Field label="Gallery image paths" hint="One per line">
          <textarea rows={3} className="field resize-none font-mono text-xs"
            value={(form.gallery || []).join('\n')}
            onChange={(e) => set({ gallery: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })} />
        </Field>

        <div className="flex flex-wrap gap-5 rounded-xl bg-cream p-4">
          {[['featured', 'Featured'], ['isNew', 'New arrival'], ['bestseller', 'Best seller']].map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={!!form[key]} onChange={(e) => set({ [key]: e.target.checked })}
                className="h-4 w-4 rounded accent-gold-500" />
              {label}
            </label>
          ))}
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <span className="label">{label}</span>
      {children}
      {hint && <p className="mt-1 text-[11px] text-ink-400">{hint}</p>}
    </div>
  );
}
