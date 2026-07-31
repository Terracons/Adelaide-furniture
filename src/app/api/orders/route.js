import { handle, body } from '@/lib/api';
import { getSession, AuthError } from '@/lib/auth';
import { listOrders, createOrder } from '@/lib/queries';

export const GET = handle(async (req) => {
  const sp = new URL(req.url).searchParams;
  const session = await getSession();
  if (!session) throw new AuthError();

  const filters = {
    status: sp.get('status') || undefined,
    search: sp.get('search') || undefined,
    limit: sp.get('limit') ? Number(sp.get('limit')) : undefined
  };
  // Customers only ever see their own orders; admins see everything.
  if (session.role !== 'admin') filters.userId = session.id;
  else if (sp.get('userId')) filters.userId = sp.get('userId');
  return listOrders(filters);
});

// Public: checkout places an order (guest checkout allowed).
export const POST = handle(async (req) => createOrder(await body(req)));
