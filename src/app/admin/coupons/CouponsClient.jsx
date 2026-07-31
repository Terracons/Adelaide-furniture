'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Ticket, Copy } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import DataTable from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { money, formatDate } from '@/lib/format';
import { getCoupons, saveCoupon, deleteCoupon } from '@/lib/data';
import { useData } from '@/lib/hooks';
import { useToast } from '@/context/ToastContext';

const BLANK = { code: '', type: 'percent', value: 10, minSpend: 0, usageLimit: 0, expiresAt: '', active: true, description: '' };

export default function CouponsClient() {
  const { data: coupons, refresh } = useData(() => getCoupons(), [], []);
  const { toast } = useToast();
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  async function save(e) {
    e.preventDefault();
    if (!editing.code.trim()) return toast('Give the coupon a code', 'error');
    await saveCoupon(editing);
    setEditing(null);
    refresh();
    toast('Coupon saved');
  }

  async function toggle(c) {
    await saveCoupon({ ...c, active: !c.active });
    refresh();
  }

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (c) => (
        <div className="flex items-center gap-2">
          <Ticket size={15} className="text-gold-500" />
          <div>
            <p className="font-mono font-bold">{c.code}</p>
            <p className="text-xs text-ink-400">{c.description}</p>
          </div>
        </div>
      )
    },
    {
      key: 'value',
      label: 'Discount',
      render: (c) => <span className="font-semibold">{c.type === 'percent' ? `${c.value}% off` : `${money(c.value)} off`}</span>
    },
    { key: 'minSpend', label: 'Min spend', align: 'right', render: (c) => (c.minSpend ? money(c.minSpend, { decimals: false }) : '-') },
    {
      key: 'usedCount',
      label: 'Used',
      align: 'right',
      render: (c) => <span className="text-ink-600">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</span>
    },
    { key: 'expiresAt', label: 'Expires', render: (c) => <span className="text-xs text-ink-400">{c.expiresAt ? formatDate(c.expiresAt) : 'Never'}</span> },
    {
      key: 'active',
      label: 'Status',
      render: (c) => (
        <button onClick={() => toggle(c)}>
          <Badge tone={c.active ? 'active' : 'draft'}>{c.active ? 'Active' : 'Paused'}</Badge>
        </button>
      )
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      align: 'right',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => { navigator.clipboard?.writeText(c.code); toast('Code copied'); }} title="Copy code"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-cream hover:text-gold-600"><Copy size={15} /></button>
          <button onClick={() => setEditing(c)} title="Edit"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-cream hover:text-gold-600"><Pencil size={15} /></button>
          <button onClick={() => setConfirm(c)} title="Delete"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
        </div>
      )
    }
  ];

  return (
    <AdminShell
      title="Coupons"
      subtitle={`${(coupons || []).filter((c) => c.active).length} active codes`}
      actions={<button onClick={() => setEditing({ ...BLANK })} className="btn-primary btn-sm"><Plus size={14} /> New coupon</button>}
    >
      <DataTable columns={columns} rows={coupons || []} searchKeys={['code', 'description']} perPage={10}
        empty="No coupons yet." />

      {editing && (
        <Modal open onClose={() => setEditing(null)} title={editing.id ? `Edit ${editing.code}` : 'New coupon'}
          footer={
            <>
              <button onClick={() => setEditing(null)} className="btn-ghost btn-sm">Cancel</button>
              <button onClick={save} className="btn-primary btn-sm">Save</button>
            </>
          }>
          <form onSubmit={save} className="space-y-4">
            <div>
              <span className="label">Code</span>
              <input className="field font-mono uppercase" value={editing.code}
                onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} placeholder="SPRING20" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="label">Type</span>
                <select className="field" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                  <option value="percent">Percentage off</option>
                  <option value="fixed">Fixed amount off</option>
                </select>
              </div>
              <div>
                <span className="label">{editing.type === 'percent' ? 'Percent' : 'Amount (AUD)'}</span>
                <input type="number" className="field" value={editing.value}
                  onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="label">Minimum spend</span>
                <input type="number" className="field" value={editing.minSpend}
                  onChange={(e) => setEditing({ ...editing, minSpend: Number(e.target.value) })} />
              </div>
              <div>
                <span className="label">Usage limit</span>
                <input type="number" className="field" value={editing.usageLimit}
                  onChange={(e) => setEditing({ ...editing, usageLimit: Number(e.target.value) })} placeholder="0 = unlimited" />
              </div>
            </div>
            <div>
              <span className="label">Expiry date</span>
              <input type="date" className="field" value={editing.expiresAt || ''}
                onChange={(e) => setEditing({ ...editing, expiresAt: e.target.value })} />
            </div>
            <div>
              <span className="label">Description</span>
              <input className="field" value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Shown in the admin list only" />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={!!editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                className="h-4 w-4 rounded accent-gold-500" />
              Active
            </label>
          </form>
        </Modal>
      )}

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        onConfirm={async () => { await deleteCoupon(confirm.id); refresh(); toast('Coupon deleted', 'info'); }}
        title={`Delete ${confirm?.code}?`} />
    </AdminShell>
  );
}
