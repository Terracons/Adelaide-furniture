import { handle, body } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { getPublicSettings, saveSettings } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => getPublicSettings());

export const PUT = handle(async (req) => {
  await requireAdmin();
  return saveSettings(await body(req));
});
