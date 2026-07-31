import { handle } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { getStats } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  await requireAdmin();
  return getStats();
});
