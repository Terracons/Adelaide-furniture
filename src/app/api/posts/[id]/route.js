import { handle } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { deletePost } from '@/lib/queries';

export const DELETE = handle(async (_req, { params }) => {
  await requireAdmin();
  await deletePost(params.id);
  return { ok: true };
});
