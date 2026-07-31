'use client';

import { useState } from 'react';
import { Ban, CheckCircle2, Mail, Trash2 } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import DataTable from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import { money, formatDate, initials } from '@/lib/format';
import { getCustomers, saveCustomer, deleteCustomer } from '@/lib/data';
import { useData } from '@/lib/hooks';
import { useToast } from '@/context/ToastContext';

export default function CustomersClient() {
  const { data: customers, refresh } = useData(() => getCustomers(), [], []);
  const { toast } = useToast();
  const [confirm, setConfirm] = useState(null);

  async function toggleStatus(c) {
    await saveCustomer({ ...c, status: c.status === 'active' ? 'blocked' : 'active' });
    refresh();
    toast(c.status === 'active' ? 'Customer blocked' : 'Customer reactivated');
  }

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-100 text-[10px] font-bold text-gold-700">
            {initials(c.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{c.name}</p>
            <p className="truncate text-xs text-ink-400">{c.email}</p>
          </div>
        </div>
      )
    },
    { key: 'city', label: 'Location', render: (c) => <span className="text-ink-500">{c.city}, {c.state}</span> },
    { key: 'orderCount', label: 'Orders', align: 'right' },
    { key: 'totalSpent', label: 'Spent', align: 'right', render: (c) => <span className="font-bold">{money(c.totalSpent, { decimals: false })}</span> },
    { key: 'lastOrder', label: 'Last order', render: (c) => <span className="text-xs text-ink-400">{c.lastOrder ? formatDate(c.lastOrder) : '-'}</span> },
    { key: 'status', label: 'Status', render: (c) => <Badge tone={c.status}>{c.status}</Badge> },
    {
      key: 'actions',
      label: '',
      sortable: false,
      align: 'right',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <a href={`mailto:${c.email}`} title="Email"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-cream hover:text-gold-600"><Mail size={15} /></a>
          <button onClick={() => toggleStatus(c)} title={c.status === 'active' ? 'Block' : 'Reactivate'}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-cream hover:text-gold-600">
            {c.status === 'active' ? <Ban size={15} /> : <CheckCircle2 size={15} />}
          </button>
          <button onClick={() => setConfirm(c)} title="Delete"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
        </div>
      )
    }
  ];

  const total = (customers || []).reduce((s, c) => s + c.totalSpent, 0);

  return (
    <AdminShell title="Customers" subtitle={`${(customers || []).length} accounts · ${money(total, { decimals: false })} lifetime value`}>
      <DataTable columns={columns} rows={customers || []} searchKeys={['name', 'email', 'city']} perPage={12}
        empty="No customers yet." />
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        onConfirm={async () => { await deleteCustomer(confirm.id); refresh(); toast('Customer deleted', 'info'); }}
        title={`Delete ${confirm?.name}?`} body="Their orders stay in the system but will no longer be linked to an account." />
    </AdminShell>
  );
}
