import { handle, body } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { listCoupons, saveCoupon } from '@/lib/queries';

export const GET = handle(async () => {
  await requireAdmin();
  return listCoupons();
});

export const POST = handle(async (req) => {
  await requireAdmin();
  return saveCoupon(await body(req));
});
