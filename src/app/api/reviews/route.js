import { handle, body } from '@/lib/api';
import { listReviews, addReview } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  const sp = new URL(req.url).searchParams;
  return listReviews({
    productId: sp.get('productId') ?? undefined,
    status: sp.get('status') || 'approved',
    limit: sp.get('limit') ? Number(sp.get('limit')) : undefined
  });
});

// Public: shoppers submit reviews (they land as 'pending' for moderation).
export const POST = handle(async (req) => addReview(await body(req)));
