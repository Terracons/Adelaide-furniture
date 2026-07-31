import { handle, body } from '@/lib/api';
import { setSessionCookie } from '@/lib/auth';
import { registerCustomer } from '@/lib/queries';

export const POST = handle(async (req) => {
  const result = await registerCustomer(await body(req));
  if (result.ok) {
    await setSessionCookie({ id: result.user.id, role: 'customer', name: result.user.name, email: result.user.email });
  }
  return result;
});
