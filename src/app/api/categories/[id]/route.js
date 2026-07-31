import { handle } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { deleteCategory } from '@/lib/queries';

export const DELETE = handle(async (_req, { params }) => {
  await requireAdmin();
  await deleteCategory(params.id);
  return { ok: true };
});
