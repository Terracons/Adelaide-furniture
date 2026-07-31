import { handle, body } from '@/lib/api';
import { validateCoupon } from '@/lib/queries';

// Public: checkout validates a code before applying it.
export const POST = handle(async (req) => {
  const { code, subtotal } = await body(req);
  return validateCoupon(code, Number(subtotal) || 0);
});
