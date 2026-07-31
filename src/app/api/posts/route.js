import { handle, body } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { listPosts, postBySlug, savePost } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  const sp = new URL(req.url).searchParams;
  if (sp.get('slug')) return postBySlug(sp.get('slug'));
  return listPosts({
    status: sp.get('status') || 'published',
    featured: sp.get('featured') === '1' || undefined,
    tag: sp.get('tag') || undefined,
    limit: sp.get('limit') ? Number(sp.get('limit')) : undefined
  });
});

export const POST = handle(async (req) => {
  await requireAdmin();
  return savePost(await body(req));
});
