import { handle, body } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { listMessages, sendMessage } from '@/lib/queries';

export const GET = handle(async () => {
  await requireAdmin();
  return listMessages();
});

// Public: the contact form.
export const POST = handle(async (req) => sendMessage(await body(req)));
