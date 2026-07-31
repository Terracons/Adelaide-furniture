import { handle, body } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { getOrder, updateOrder, deleteOrder } from '@/lib/queries';

// Public lookup by id or order-number (used by the confirmation page). The
// order number is unguessable-ish; tighten to an owner check if needed.
export const GET = handle(async (_req, { params }) => getOrder(params.id));

export const PATCH = handle(async (req, { params }) => {
  await requireAdmin();
  return updateOrder(params.id, await body(req));
});

export const DELETE = handle(async (_req, { params }) => {
  await requireAdmin();
  await deleteOrder(params.id);
  return { ok: true };
});
