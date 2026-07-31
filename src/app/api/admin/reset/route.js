import { handle } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { reseed } from '@/lib/queries';

// Admin "reset demo data": reloads every table from the shipped seed JSON.
export const POST = handle(async () => {
  await requireAdmin();
  await reseed();
  return { ok: true };
});
