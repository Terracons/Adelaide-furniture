import { handle, body, productOpts } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import {
  listProducts, allProducts, productBySlug, productById,
  relatedProducts, filterOptions, saveProduct
} from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  const sp = new URL(req.url).searchParams;
  if (sp.get('filterOptions')) return filterOptions();
  if (sp.get('all')) return allProducts();
  if (sp.get('slug')) return productBySlug(sp.get('slug'));
  if (sp.get('id')) return productById(sp.get('id'));
  if (sp.get('related')) return relatedProducts(sp.get('related'), Number(sp.get('limit')) || 4);
  return listProducts(productOpts(sp));
});

export const POST = handle(async (req) => {
  await requireAdmin();
  return saveProduct(await body(req));
});
