import { handle, body } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { listSubscribers, subscribeEmail } from '@/lib/queries';

export const GET = handle(async () => {
  await requireAdmin();
  return listSubscribers();
});

// Public: newsletter signup.
export const POST = handle(async (req) => {
  const { email } = await body(req);
  return subscribeEmail(email);
});
