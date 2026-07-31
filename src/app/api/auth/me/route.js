import { handle } from '@/lib/api';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  const session = await getSession();
  return { user: session || null };
});
