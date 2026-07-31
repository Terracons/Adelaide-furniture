import { handle, body } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { listCategories, getCategory, saveCategory } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  const slug = new URL(req.url).searchParams.get('slug');
  return slug ? getCategory(slug) : listCategories();
});

export const POST = handle(async (req) => {
  await requireAdmin();
  return saveCategory(await body(req));
});
