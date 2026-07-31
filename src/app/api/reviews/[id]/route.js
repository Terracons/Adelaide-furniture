import { handle, body } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { updateReview, deleteReview } from '@/lib/queries';

export const PATCH = handle(async (req, { params }) => {
  await requireAdmin();
  return updateReview(params.id, await body(req));
});

export const DELETE = handle(async (_req, { params }) => {
  await requireAdmin();
  await deleteReview(params.id);
  return { ok: true };
});
