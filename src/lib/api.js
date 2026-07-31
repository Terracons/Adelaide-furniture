/**
 * Shared helpers for API route handlers. SERVER ONLY.
 */
import { NextResponse } from 'next/server';
import { AuthError } from './auth';

/** Wrap a handler: JSON-serialise the result, map errors to status codes. */
export function handle(fn) {
  return async (req, ctx) => {
    try {
      const result = await fn(req, ctx);
      return result instanceof NextResponse ? result : NextResponse.json(result ?? null);
    } catch (err) {
      if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error('[api]', err);
      return NextResponse.json({ error: err.message || 'Server error' }, { status: 400 });
    }
  };
}

export async function body(req) {
  try { return await req.json(); } catch { return {}; }
}

const bool = (v) => v === '1' || v === 'true';

/** Parse product-list options out of the query string. */
export function productOpts(searchParams) {
  const g = (k) => searchParams.get(k);
  const opts = { sort: g('sort') || 'featured' };
  if (g('category')) opts.category = g('category');
  if (g('search')) opts.search = g('search');
  if (g('minPrice') != null && g('minPrice') !== '') opts.minPrice = Number(g('minPrice'));
  if (g('maxPrice') != null && g('maxPrice') !== '') opts.maxPrice = Number(g('maxPrice'));
  if (g('colors')) opts.colors = g('colors').split(',').filter(Boolean);
  if (g('page')) opts.page = Number(g('page'));
  if (g('perPage')) opts.perPage = Number(g('perPage'));
  if (g('status')) opts.status = g('status');
  if (bool(g('featured'))) opts.featured = true;
  if (bool(g('isNew'))) opts.isNew = true;
  if (bool(g('bestseller'))) opts.bestseller = true;
  if (bool(g('inStock'))) opts.inStock = true;
  return opts;
}
