import { handle, body } from '@/lib/api';
import { setSessionCookie } from '@/lib/auth';
import { loginCustomer } from '@/lib/queries';

export const POST = handle(async (req) => {
  const { email, password } = await body(req);
  const result = await loginCustomer(email, password);
  if (result.ok) {
    await setSessionCookie({ id: result.user.id, role: 'customer', name: result.user.name, email: result.user.email });
  }
  return result;
});
