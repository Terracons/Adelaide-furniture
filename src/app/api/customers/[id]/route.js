import { handle } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { deleteCustomer } from '@/lib/queries';

export const DELETE = handle(async (_req, { params }) => {
  await requireAdmin();
  await deleteCustomer(params.id);
  return { ok: true };
});
