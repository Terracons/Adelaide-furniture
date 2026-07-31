import { put } from '@vercel/blob';
import { handle } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

/**
 * Admin image upload -> Vercel Blob. Returns { url } for storing on a product,
 * category or blog post. The <img>-based <Img> component renders the URL as-is.
 *
 * Client sends the raw file as the request body with ?filename=foo.jpg.
 */
export const POST = handle(async (req) => {
  await requireAdmin();

  const filename = new URL(req.url).searchParams.get('filename');
  if (!filename) throw new Error('Missing ?filename');
  if (!req.body) throw new Error('Missing file body');

  const blob = await put(`uploads/${Date.now()}-${filename}`, req.body, {
    access: 'public',
    addRandomSuffix: true
  });
  return { url: blob.url };
});
