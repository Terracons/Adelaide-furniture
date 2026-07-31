import { handle, body } from '@/lib/api';
import { setSessionCookie } from '@/lib/auth';
import { adminLogin } from '@/lib/queries';

export const POST = handle(async (req) => {
  const { email, password } = await body(req);
  const result = await adminLogin(email, password);
  if (result.ok) {
    await setSessionCookie({ role: 'admin', name: result.user.name, email: result.user.email });
  }
  return result;
});
