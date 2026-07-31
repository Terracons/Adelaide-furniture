'use client';

import { useState } from 'react';
import { Eye, Trash2, Printer } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import DataTable from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Img from '@/components/ui/Img';
import { money, formatDate, ORDER_STATUSES } from '@/lib/format';
import { getOrders, updateOrder, deleteOrder } from '@/lib/data';
import { useData } from '@/lib/hooks';
import { useToast } from '@/context/ToastContext';

const PAYMENT_STATUSES = ['pending', 'paid', 'refunded', 'failed'];

export default function OrdersAdminClient() {
  const { data: orders, refresh } = useData(() => getOrders(), [], []);
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');
  const [viewing, setViewing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const rows = (orders || []).filter((o) => filter === 'all' || o.status === filter);

  async function setStatus(order, patch) {
    await updateOrder(order.id, patch);
    refresh();
    setViewing((v) => (v && v.id === order.id ? { ...v, ...patch } : v));
    toast('Order updated');
  }

  async function remove(id) {
    await deleteOrder(id);
    refresh();
    toast('Order deleted', 'info');
  }

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order',
      render: (o) => (
        <div>
          <p className="font-semibold">{o.orderNumber}</p>
          <p className="text-xs text-ink-400">{o.items.length} items</p>
        </div>
      )
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (o) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{o.customerName}</p>
          <p className="truncate text-xs text-ink-400">{o.city}, {o.state}</p>
        </div>
      )
    },
    { key: 'createdAt', label: 'Date', render: (o) => <span className="text-xs text-ink-500">{formatDate(o.createdAt)}</span> },
    { key: 'paymentStatus', label: 'Payment', render: (o) => <Badge tone={o.paymentStatus}>{o.paymentStatus}</Badge> },
    {
      key: 'status',
      label: 'Status',
      render: (o) => (
        <select value={o.status} onChange={(e) => setStatus(o, { status: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs font-medium capitalize focus:border-gold-500">
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      )
    },
    { key: 'total', label: 'Total', align: 'right', render: (o) => <span className="font-bold">{money(o.total)}</span> },
    {
      key: 'actions',
      label: '',
      sortable: false,
      align: 'right',
      render: (o) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => setViewing(o)} title="View"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-cream hover:text-gold-600"><Eye size={15} /></button>
          <button onClick={() => setConfirm(o)} title="Delete"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
        </div>
      )
    }
  ];

  const counts = (orders || []).reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

  return (
    <AdminShell title="Orders" subtitle={`${(orders || []).length} orders placed`}>
      <div className="mb-4 flex flex-wrap gap-2">
        {['all', ...ORDER_STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
              filter === s ? 'bg-ink text-cream' : 'bg-white text-ink-500 shadow-soft hover:text-gold-600'
            }`}>
            {s} {s !== 'all' && <span className="opacity-60">({counts[s] || 0})</span>}
          </button>
        ))}
      </div>

      <DataTable columns={columns} rows={rows} searchKeys={['orderNumber', 'customerName', 'customerEmail', 'city']}
        perPage={10} empty="No orders match this filter." />

      {viewing && (
        <Modal open onClose={() => setViewing(null)} width="max-w-2xl" title={`Order ${viewing.orderNumber}`}
          footer={
            <>
              <button onClick={() => window.print()} className="btn-ghost btn-sm"><Printer size={14} /> Print</button>
              <button onClick={() => setViewing(null)} className="btn-primary btn-sm">Close</button>
            </>
          }>
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Panel title="Customer">
                {viewing.customerName}<br />{viewing.customerEmail}<br />{viewing.customerPhone}
              </Panel>
              <Panel title="Delivering to">
                {viewing.address}<br />{viewing.city} {viewing.state} {viewing.postcode}<br />{viewing.country}
              </Panel>
            </div>

            {viewing.notes && <Panel title="Delivery notes">{viewing.notes}</Panel>}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="label">Order status</span>
                <select value={viewing.status} onChange={(e) => setStatus(viewing, { status: e.target.value })} className="field capitalize">
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <span className="label">Payment status</span>
                <select value={viewing.paymentStatus} onChange={(e) => setStatus(viewing, { paymentStatus: e.target.value })} className="field capitalize">
                  {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <span className="label">Items</span>
              <ul className="divide-y divide-ink-100 rounded-xl border border-ink-100">
                {viewing.items.map((i, idx) => (
                  <li key={idx} className="flex items-center gap-3 p-3">
                    <Img src={i.image} alt="" className="h-12 w-12 rounded-lg bg-cream-dark object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{i.name}</p>
                      <p className="text-xs text-ink-400">{i.variant} &middot; Qty {i.quantity} &middot; {money(i.price)} each</p>
                    </div>
                    <span className="text-sm font-bold">{money(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="space-y-1.5 rounded-xl bg-cream p-4 text-sm">
              <Row label="Subtotal" value={money(viewing.subtotal)} />
              {viewing.discount > 0 && <Row label={`Discount ${viewing.couponCode ? `(${viewing.couponCode})` : ''}`} value={`- ${money(viewing.discount)}`} />}
              <Row label="Delivery" value={viewing.shipping === 0 ? 'Free' : money(viewing.shipping)} />
              <Row label="GST included" value={money(viewing.tax)} />
              <div className="flex justify-between border-t border-ink-200 pt-2 text-base font-bold">
                <dt>Total</dt><dd>{money(viewing.total)}</dd>
              </div>
              <p className="pt-1 text-xs text-ink-400">Paid by {viewing.paymentMethod} on {formatDate(viewing.createdAt, 'long')}</p>
            </dl>
          </div>
        </Modal>
      )}

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => remove(confirm.id)}
        title={`Delete ${confirm?.orderNumber}?`} body="The order record will be removed permanently." />
    </AdminShell>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-xl bg-cream p-3.5">
      <p className="label">{title}</p>
      <p className="text-sm leading-relaxed text-ink-600">{children}</p>
    </div>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between"><dt className="text-ink-500">{label}</dt><dd className="font-semibold">{value}</dd></div>;
}
