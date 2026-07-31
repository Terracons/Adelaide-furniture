import { handle } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { deleteCoupon } from '@/lib/queries';

export const DELETE = handle(async (_req, { params }) => {
  await requireAdmin();
  await deleteCoupon(params.id);
  return { ok: true };
});
