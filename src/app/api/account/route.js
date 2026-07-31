import { handle, body } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { updateProfile } from '@/lib/queries';

// A logged-in customer editing their own profile. Scoped to the session's id,
// so it can't be used to edit other accounts (unlike the admin /api/customers).
export const PATCH = handle(async (req) => {
  const session = await requireUser();
  return updateProfile(session.id, await body(req));
});
