/**
 * ============================================================================
 *  THE DATA LAYER  -  the only file the app talks to for data.
 * ============================================================================
 *  Every page and component calls the async functions below. They now fetch
 *  the /api routes (which query Neon Postgres and enforce auth). The function
 *  names and shapes are unchanged from the localStorage version, so nothing
 *  else in the codebase needed to change. See MIGRATE-TO-SERVER.md (Route D).
 *
 *  Static content that never changes (testimonials, FAQs) is still read
 *  straight from the seed JSON — no round-trip needed.
 * ============================================================================
 */
import seedTestimonials from '@/data/testimonials.json';
import seedFaqs from '@/data/faqs.json';
import { touch } from './store';

/* ------------------------------------------------------------- transport  */

const isServer = typeof window === 'undefined';

/** Absolute origin on the server; empty (relative) in the browser. */
function origin() {
  if (!isServer) return '';
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

async function req(path, options = {}) {
  const res = await fetch(`${origin()}/api/${path}`, {
    // Never cache data reads — the whole point is live data.
    cache: 'no-store',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try { message = (await res.json()).error || message; } catch { /* keep default */ }
    throw new Error(message);
  }
  // After a successful write, nudge client subscribers (useData) to refresh.
  if (!isServer && options.method && options.method !== 'GET') touch();
  if (res.status === 204) return null;
  return res.json();
}

const qs = (params) => {
  const s = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v == null || v === '') return;
    s.set(k, Array.isArray(v) ? v.join(',') : String(v));
  });
  const str = s.toString();
  return str ? `?${str}` : '';
};

/* --------------------------------------------------------------- settings */

export const getSettings = () => req('settings');
export const saveSettings = (patch) => req('settings', { method: 'PUT', body: JSON.stringify(patch) });

// Static seed content.
export async function getTestimonials() { return seedTestimonials; }
export async function getFaqs() { return seedFaqs; }

/* ------------------------------------------------------------- categories */

export const getCategories = () => req('categories');
export const getCategory = (slug) => req(`categories${qs({ slug })}`);
export const saveCategory = (input) => req('categories', { method: 'POST', body: JSON.stringify(input) });
export const deleteCategory = (id) => req(`categories/${id}`, { method: 'DELETE' });

/* --------------------------------------------------------------- products */

export const getProducts = (opts = {}) => req(`products${qs(opts)}`);
export const getAllProducts = () => req('products?all=1');
export const getProduct = (slug) => req(`products${qs({ slug })}`);
export const getProductById = (id) => req(`products${qs({ id })}`);

export function getRelatedProducts(product, limit = 4) {
  if (!product) return Promise.resolve([]);
  return req(`products${qs({ related: product.id, limit })}`);
}

export async function searchProducts(term, limit = 6) {
  const { items } = await getProducts({ search: term, perPage: limit, sort: 'rating' });
  return items;
}

export const saveProduct = (input) => req('products', { method: 'POST', body: JSON.stringify(input) });
export const deleteProduct = (id) => req(`products/${id}`, { method: 'DELETE' });
export const getFilterOptions = () => req('products?filterOptions=1');

/* ---------------------------------------------------------------- reviews */

export const getReviews = (opts = {}) => req(`reviews${qs(opts)}`);
export const addReview = (input) => req('reviews', { method: 'POST', body: JSON.stringify(input) });
export const updateReview = (id, patch) => req(`reviews/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
export const deleteReview = (id) => req(`reviews/${id}`, { method: 'DELETE' });

/* ------------------------------------------------------------------ blog  */

export const getPosts = (opts = {}) => req(`posts${qs(opts)}`);
export const getPost = (slug) => req(`posts${qs({ slug })}`);
export const savePost = (input) => req('posts', { method: 'POST', body: JSON.stringify(input) });
export const deletePost = (id) => req(`posts/${id}`, { method: 'DELETE' });

/* --------------------------------------------------------------- coupons  */

export const getCoupons = () => req('coupons');
export const validateCoupon = (code, subtotal) =>
  req('coupons/validate', { method: 'POST', body: JSON.stringify({ code, subtotal }) });
export const saveCoupon = (input) => req('coupons', { method: 'POST', body: JSON.stringify(input) });
export const deleteCoupon = (id) => req(`coupons/${id}`, { method: 'DELETE' });

/* ---------------------------------------------------------------- orders  */

export const getOrders = (opts = {}) => req(`orders${qs(opts)}`);
export const getOrder = (idOrNumber) => req(`orders/${encodeURIComponent(idOrNumber)}`);
export const createOrder = (payload) => req('orders', { method: 'POST', body: JSON.stringify(payload) });
export const updateOrder = (id, patch) => req(`orders/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
export const deleteOrder = (id) => req(`orders/${id}`, { method: 'DELETE' });

/* ------------------------------------------------------------- customers  */

export const getCustomers = (opts = {}) => req(`customers${qs(opts)}`);
export const getCustomer = (id) => req(`customers${qs({ id })}`);
export const saveCustomer = (input) => req('customers', { method: 'POST', body: JSON.stringify(input) });
export const deleteCustomer = (id) => req(`customers/${id}`, { method: 'DELETE' });

/* ------------------------------------------------------------------ auth  */

export const registerCustomer = (payload) => req('auth/register', { method: 'POST', body: JSON.stringify(payload) });
export const loginCustomer = (email, password) => req('auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const adminLogin = (email, password) => req('auth/admin-login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const logout = () => req('auth/logout', { method: 'POST' });
export const getCurrentUser = () => req('auth/me');
export const updateProfile = (patch) => req('account', { method: 'PATCH', body: JSON.stringify(patch) });

/* --------------------------------------------------------------- uploads  */

/** Upload an image File to Vercel Blob (admin only). Returns { url }. */
export async function uploadImage(file) {
  const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    body: file,
    credentials: 'include'
  });
  if (!res.ok) {
    let message = 'Upload failed';
    try { message = (await res.json()).error || message; } catch { /* keep default */ }
    throw new Error(message);
  }
  return res.json();
}

/* -------------------------------------------------------------- messages  */

export const sendMessage = (input) => req('messages', { method: 'POST', body: JSON.stringify(input) });
export const getMessages = () => req('messages');
export const updateMessage = (id, patch) => req(`messages/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
export const deleteMessage = (id) => req(`messages/${id}`, { method: 'DELETE' });
export const subscribeEmail = (email) => req('subscribers', { method: 'POST', body: JSON.stringify({ email }) });
export const getSubscribers = () => req('subscribers');

/* ------------------------------------------------------------ dashboard   */

export const getStats = () => req('stats');

/** Admin "reset demo data" — reloads every table from the seed JSON. */
export const resetDemoData = () => req('admin/reset', { method: 'POST' });
