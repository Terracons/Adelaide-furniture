import { handle, body } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { updateMessage, deleteMessage } from '@/lib/queries';

export const PATCH = handle(async (req, { params }) => {
  await requireAdmin();
  return updateMessage(params.id, await body(req));
});

export const DELETE = handle(async (_req, { params }) => {
  await requireAdmin();
  await deleteMessage(params.id);
  return { ok: true };
});
