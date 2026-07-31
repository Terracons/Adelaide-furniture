import { handle, body } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { listCustomers, getCustomer, saveCustomer } from '@/lib/queries';

export const GET = handle(async (req) => {
  await requireAdmin();
  const sp = new URL(req.url).searchParams;
  if (sp.get('id')) return getCustomer(sp.get('id'));
  return listCustomers({ search: sp.get('search') || undefined });
});

export const POST = handle(async (req) => {
  await requireAdmin();
  return saveCustomer(await body(req));
});
