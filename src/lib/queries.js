/**
 * ============================================================================
 *  Server-side data logic.  SERVER ONLY — imported by API route handlers.
 * ============================================================================
 *  This is the old localStorage logic from data.js, re-pointed at Neon. The
 *  client never imports this file; it talks to the /api routes, which call
 *  these functions. Passwords are hashed; admin secrets never leave here.
 * ============================================================================
 */
import {
  sql, COLLECTIONS,
  collection, findById, insertRow, updateRow, deleteRow,
  getSettingsRow, saveSettingsRow
} from './db';
import { hashPassword, verifyPassword } from './auth';
import { slugify } from './format';

import seedProducts from '@/data/products.json';
import seedCategories from '@/data/categories.json';
import seedOrders from '@/data/orders.json';
import seedCustomers from '@/data/customers.json';
import seedReviews from '@/data/reviews.json';
import seedPosts from '@/data/posts.json';
import seedCoupons from '@/data/coupons.json';
import seedSettings from '@/data/settings.json';

const byId = (rows, id) => rows.find((r) => String(r.id) === String(id)) || null;

/* -------------------------------------------------------------- settings  */

/** Public settings — admin credentials stripped. */
export async function getPublicSettings() {
  const s = (await getSettingsRow()) || {};
  const { admin, ...pub } = s;
  return pub;
}

export async function saveSettings(patch) {
  const current = (await getSettingsRow()) || {};
  const { admin: _ignore, ...safe } = patch || {};   // admin creds not editable here
  const next = { ...current, ...safe };
  await saveSettingsRow(next);
  const { admin, ...pub } = next;
  return pub;
}

/* ------------------------------------------------------------ categories  */

export async function listCategories() {
  const [cats, products] = await Promise.all([collection('categories'), collection('products')]);
  return cats.map((c) => ({
    ...c,
    count: products.filter((p) => p.category === c.slug && p.status === 'published').length
  }));
}

export async function getCategory(slug) {
  return (await listCategories()).find((c) => c.slug === slug) || null;
}

export async function saveCategory(input) {
  const data = { ...input, slug: input.slug || slugify(input.name) };
  if (data.id) {
    return updateRow('categories', data.id, data);
  }
  return insertRow('categories', { ...data, image: data.image || '/images/categories/decor.svg' });
}

export const deleteCategory = (id) => deleteRow('categories', id);

/* -------------------------------------------------------------- products  */

function sortProducts(items, sort) {
  const s = [...items];
  switch (sort) {
    case 'price-asc':  return s.sort((a, b) => a.price - b.price);
    case 'price-desc': return s.sort((a, b) => b.price - a.price);
    case 'name-asc':   return s.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':  return s.sort((a, b) => b.name.localeCompare(a.name));
    case 'rating':     return s.sort((a, b) => b.rating - a.rating);
    case 'newest':     return s.sort((a, b) => (b.isNew === a.isNew ? b.id - a.id : b.isNew - a.isNew));
    default:           return s.sort((a, b) => (b.featured === a.featured ? b.rating - a.rating : b.featured - a.featured));
  }
}

export async function listProducts(opts = {}) {
  const {
    category, search, minPrice, maxPrice, colors, sort = 'featured',
    page = 1, perPage = 12, featured, isNew, bestseller,
    status = 'published', inStock
  } = opts;

  let items = await collection('products');

  if (status !== 'all') items = items.filter((p) => p.status === status);
  if (category && category !== 'all') items = items.filter((p) => p.category === category);
  if (featured) items = items.filter((p) => p.featured);
  if (isNew) items = items.filter((p) => p.isNew);
  if (bestseller) items = items.filter((p) => p.bestseller);
  if (inStock) items = items.filter((p) => p.stock > 0);
  if (minPrice != null) items = items.filter((p) => p.price >= Number(minPrice));
  if (maxPrice != null) items = items.filter((p) => p.price <= Number(maxPrice));
  if (colors && colors.length)
    items = items.filter((p) => (p.colors || []).some((c) => colors.includes(c)));
  if (search) {
    const q = String(search).toLowerCase();
    items = items.filter((p) =>
      [p.name, p.shortDescription, p.category, p.sku, (p.tags || []).join(' ')]
        .join(' ').toLowerCase().includes(q)
    );
  }

  items = sortProducts(items, sort);

  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, Number(page)), pages);
  const start = (current - 1) * perPage;
  return { items: items.slice(start, start + perPage), total, pages, page: current };
}

export const allProducts = () => collection('products');

export async function productBySlug(slug) {
  return (await collection('products')).find((p) => p.slug === slug) || null;
}

export async function productById(id) {
  return findById('products', id);
}

export async function relatedProducts(productId, limit = 4) {
  const all = await collection('products');
  const product = byId(all, productId);
  if (!product) return [];
  const pool = all.filter((p) => p.id !== product.id && p.status === 'published');
  const same = pool.filter((p) => p.category === product.category);
  const rest = pool.filter((p) => p.category !== product.category);
  return [...same, ...rest].slice(0, limit);
}

export async function filterOptions() {
  const items = (await collection('products')).filter((p) => p.status === 'published');
  const colors = [...new Set(items.flatMap((p) => p.colors || []))].sort();
  const prices = items.map((p) => p.price);
  return { colors, minPrice: Math.min(...prices, 0), maxPrice: Math.max(...prices, 5000) };
}

export async function saveProduct(input) {
  const slug = input.slug || slugify(input.name);
  const base = {
    ...input,
    slug,
    price: Number(input.price) || 0,
    comparePrice: input.comparePrice ? Number(input.comparePrice) : null,
    stock: Number(input.stock) || 0,
    rating: Number(input.rating) || 0,
    reviewCount: Number(input.reviewCount) || 0,
    colors: Array.isArray(input.colors)
      ? input.colors
      : String(input.colors || '').split(',').map((c) => c.trim()).filter(Boolean)
  };

  if (input.id) {
    return updateRow('products', input.id, { ...base, updatedAt: new Date().toISOString() });
  }
  const image = base.image || '/images/products/sena-ribbed-vase-1.svg';
  return insertRow('products', {
    ...base,
    image,
    gallery: base.gallery && base.gallery.length ? base.gallery : [image],
    createdAt: new Date().toISOString().slice(0, 10),
    status: base.status || 'published'
  });
}

export const deleteProduct = (id) => deleteRow('products', id);

/* --------------------------------------------------------------- reviews  */

export async function listReviews({ productId, status = 'approved', limit } = {}) {
  let rows = await collection('reviews');
  if (productId != null) rows = rows.filter((r) => String(r.productId) === String(productId));
  if (status !== 'all') rows = rows.filter((r) => r.status === status);
  rows = rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return limit ? rows.slice(0, limit) : rows;
}

export async function addReview(input) {
  const { id, status, createdAt, ...rest } = input; // client can't set these
  return insertRow('reviews', {
    ...rest,
    rating: Number(rest.rating) || 5,
    status: 'pending', // always queued for moderation
    createdAt: new Date().toISOString().slice(0, 10)
  });
}

export const updateReview = (id, patch) => updateRow('reviews', id, patch);
export const deleteReview = (id) => deleteRow('reviews', id);

/* ------------------------------------------------------------------ blog  */

export async function listPosts({ status = 'published', limit, featured, tag } = {}) {
  let rows = await collection('posts');
  if (status !== 'all') rows = rows.filter((p) => (p.status || 'published') === status);
  if (featured) rows = rows.filter((p) => p.featured);
  if (tag) rows = rows.filter((p) => (p.tags || []).includes(tag));
  rows = rows.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  return limit ? rows.slice(0, limit) : rows;
}

export async function postBySlug(slug) {
  return (await collection('posts')).find((p) => p.slug === slug) || null;
}

export async function savePost(input) {
  const data = { ...input, slug: input.slug || slugify(input.title) };
  if (data.id) return updateRow('posts', data.id, data);
  return insertRow('posts', {
    cover: '/images/blog/post-1.svg',
    author: 'Adelaide Studio',
    readTime: 5,
    publishedAt: new Date().toISOString().slice(0, 10),
    status: 'published',
    tags: [],
    ...data
  });
}

export const deletePost = (id) => deleteRow('posts', id);

/* --------------------------------------------------------------- coupons  */

export const listCoupons = () => collection('coupons');

export async function validateCoupon(code, subtotal) {
  const rows = await collection('coupons');
  const c = rows.find((r) => r.code.toLowerCase() === String(code || '').trim().toLowerCase());

  if (!c) return { valid: false, message: 'That code is not recognised.', discount: 0 };
  if (!c.active) return { valid: false, message: 'That code is no longer active.', discount: 0 };
  if (c.expiresAt && new Date(c.expiresAt) < new Date())
    return { valid: false, message: 'That code has expired.', discount: 0 };
  if (c.usageLimit > 0 && c.usedCount >= c.usageLimit)
    return { valid: false, message: 'That code has been fully redeemed.', discount: 0 };
  if (subtotal < c.minSpend)
    return { valid: false, discount: 0, message: `Spend at least $${c.minSpend.toLocaleString()} to use this code.` };

  const discount = c.type === 'percent'
    ? Math.round(subtotal * (c.value / 100) * 100) / 100
    : Math.min(c.value, subtotal);
  return { valid: true, message: `${c.code} applied.`, discount, coupon: c };
}

export async function saveCoupon(input) {
  const data = {
    ...input,
    code: String(input.code || '').toUpperCase().trim(),
    value: Number(input.value) || 0,
    minSpend: Number(input.minSpend) || 0,
    usageLimit: Number(input.usageLimit) || 0
  };
  if (data.id) return updateRow('coupons', data.id, data);
  return insertRow('coupons', { usedCount: 0, active: true, ...data });
}

export const deleteCoupon = (id) => deleteRow('coupons', id);

/* ---------------------------------------------------------------- orders  */

export async function listOrders({ status, search, userId, limit } = {}) {
  let rows = await collection('orders');
  if (status && status !== 'all') rows = rows.filter((o) => o.status === status);
  if (userId != null) rows = rows.filter((o) => String(o.userId) === String(userId));
  if (search) {
    const q = String(search).toLowerCase();
    rows = rows.filter((o) =>
      [o.orderNumber, o.customerName, o.customerEmail, o.city].join(' ').toLowerCase().includes(q));
  }
  rows = rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt) || b.id - a.id);
  return limit ? rows.slice(0, limit) : rows;
}

export async function getOrder(idOrNumber) {
  const rows = await collection('orders');
  return rows.find((o) => String(o.id) === String(idOrNumber)) ||
         rows.find((o) => o.orderNumber === idOrNumber) || null;
}

/** Multi-table write: create order, decrement stock, count coupon redemption. */
export async function createOrder(payload) {
  // Strip fields the client must not control: order state and identifiers are
  // set by the server, never trusted from the request body.
  const { id, status, paymentStatus, orderNumber, createdAt, ...rest } = payload;
  const order = await insertRow('orders', {
    ...rest,
    country: rest.country || 'Australia',
    createdAt: new Date().toISOString().slice(0, 10),
    status: 'pending',
    paymentStatus: rest.paymentMethod === 'Bank transfer' ? 'pending' : 'paid'
  });
  // orderNumber derives from the assigned id.
  order.orderNumber = 'ADL-' + String(30000 + order.id * 13);
  await updateRow('orders', order.id, { orderNumber: order.orderNumber });

  for (const item of order.items || []) {
    const p = await productById(item.productId);
    if (p) await updateRow('products', p.id, { stock: Math.max(0, p.stock - item.quantity) });
  }

  if (order.couponCode) {
    const coupons = await collection('coupons');
    const c = coupons.find((x) => x.code === order.couponCode);
    if (c) await updateRow('coupons', c.id, { usedCount: (c.usedCount || 0) + 1 });
  }
  return order;
}

export const updateOrder = (id, patch) =>
  updateRow('orders', id, { ...patch, updatedAt: new Date().toISOString() });
export const deleteOrder = (id) => deleteRow('orders', id);

/* ------------------------------------------------------------- customers  */

export async function listCustomers({ search } = {}) {
  const [customers, orders] = await Promise.all([collection('customers'), collection('orders')]);
  let rows = customers.map(({ passwordHash, ...c }) => {   // never expose the hash
    const mine = orders.filter((o) => String(o.userId) === String(c.id));
    return {
      ...c,
      orderCount: mine.length,
      totalSpent: mine.reduce((sum, o) => sum + (o.status === 'cancelled' ? 0 : o.total), 0),
      lastOrder: mine.length
        ? mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt : null
    };
  });
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter((c) => [c.name, c.email, c.city].join(' ').toLowerCase().includes(q));
  }
  return rows.sort((a, b) => b.totalSpent - a.totalSpent);
}

export async function getCustomer(id) {
  return byId(await listCustomers(), id);
}

export async function saveCustomer(input) {
  const { password, ...rest } = input;
  const patch = { ...rest };
  if (password) patch.passwordHash = await hashPassword(password);
  if (input.id) {
    const saved = await updateRow('customers', input.id, patch);
    const { passwordHash, ...clean } = saved || {};
    return clean;
  }
  const saved = await insertRow('customers', {
    role: 'customer', status: 'active', country: 'Australia',
    createdAt: new Date().toISOString().slice(0, 10), ...patch
  });
  const { passwordHash, ...clean } = saved;
  return clean;
}

export const deleteCustomer = (id) => deleteRow('customers', id);

/** A customer editing their own record. Role/status are not self-editable. */
export async function updateProfile(id, patch) {
  const { password, role, status, id: _drop, passwordHash: _h, ...safe } = patch || {};
  if (password) safe.passwordHash = await hashPassword(password);
  const saved = await updateRow('customers', id, safe);
  if (!saved) return { ok: false };
  const { passwordHash, ...clean } = saved;
  return { ok: true, user: clean };
}

/* ------------------------------------------------------------------ auth  */

export async function registerCustomer(input) {
  // Never let the request set role/status/id/passwordHash — privilege injection.
  const { name, email, password, role, status, id, passwordHash: _ph, ...rest } = input || {};

  if (!name || !email || !password)
    return { ok: false, message: 'Name, email and password are required.' };
  if (String(password).length < 8)
    return { ok: false, message: 'Password must be at least 8 characters.' };

  const rows = await collection('customers');
  if (rows.some((c) => (c.email || '').toLowerCase() === String(email).toLowerCase()))
    return { ok: false, message: 'An account with that email already exists.' };

  const saved = await insertRow('customers', {
    ...rest,
    name, email,
    passwordHash: await hashPassword(password),
    role: 'customer', status: 'active',
    country: rest.country || 'Australia',
    createdAt: new Date().toISOString().slice(0, 10)
  });
  const { passwordHash, ...user } = saved;
  return { ok: true, user };
}

export async function loginCustomer(email, password) {
  const user = (await collection('customers'))
    .find((c) => (c.email || '').toLowerCase() === String(email).toLowerCase());
  if (!user) return { ok: false, message: 'No account found with that email.' };
  if (!(await verifyPassword(password, user.passwordHash)))
    return { ok: false, message: 'That password is not correct.' };
  if (user.status === 'blocked') return { ok: false, message: 'This account has been suspended.' };
  const { passwordHash, ...clean } = user;
  return { ok: true, user: clean };
}

export async function adminLogin(email, password) {
  const settings = (await getSettingsRow()) || {};
  const a = settings.admin || {};
  const emailOk = String(email).toLowerCase() === String(a.email || '').toLowerCase();
  if (emailOk && (await verifyPassword(password, a.passwordHash))) {
    return { ok: true, user: { name: a.name, email: a.email, role: 'admin' } };
  }
  return { ok: false, message: 'Those admin credentials are not correct.' };
}

/* -------------------------------------------------------------- messages  */

export async function sendMessage(input) {
  const { id, isRead, createdAt, ...rest } = input || {};
  return insertRow('messages', { ...rest, isRead: false, createdAt: new Date().toISOString() });
}

export const listMessages = () => collection('messages');
export const updateMessage = (id, patch) => updateRow('messages', id, patch);
export const deleteMessage = (id) => deleteRow('messages', id);

export async function subscribeEmail(email) {
  const rows = await collection('subscribers');
  if (rows.some((s) => (s.email || '').toLowerCase() === String(email).toLowerCase()))
    return { ok: true, message: "You're already on the list." };
  await insertRow('subscribers', { email, createdAt: new Date().toISOString() });
  return { ok: true, message: 'Thanks - check your inbox for a welcome note.' };
}

export const listSubscribers = () => collection('subscribers');

/* ------------------------------------------------------------ dashboard   */

export async function getStats() {
  const [orders, products, customers, reviews] = await Promise.all([
    collection('orders'), collection('products'), collection('customers'), collection('reviews')
  ]);

  const live = orders.filter((o) => o.status !== 'cancelled');
  const revenue = live.reduce((s, o) => s + o.total, 0);
  const units = live.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0);

  const monthly = {};
  live.forEach((o) => {
    const key = String(o.createdAt).slice(0, 7);
    monthly[key] = (monthly[key] || 0) + o.total;
  });
  const revenueByMonth = Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-AU', { month: 'short' }),
      total: Math.round(total)
    }));

  const tally = {};
  live.forEach((o) => o.items.forEach((i) => { tally[i.productId] = (tally[i.productId] || 0) + i.quantity; }));
  const topProducts = Object.entries(tally)
    .sort(([, a], [, b]) => b - a).slice(0, 5)
    .map(([id, qty]) => {
      const p = products.find((x) => String(x.id) === String(id));
      return { id, qty, name: p?.name || 'Removed product', image: p?.image, revenue: (p?.price || 0) * qty };
    });

  const byCategory = products.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
  const statusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

  return {
    revenue,
    orderCount: orders.length,
    liveOrderCount: live.length,
    avgOrderValue: live.length ? revenue / live.length : 0,
    unitsSold: units,
    productCount: products.length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock < 10).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    customerCount: customers.length,
    pendingReviews: reviews.filter((r) => r.status === 'pending').length,
    revenueByMonth,
    topProducts,
    byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
    statusCounts,
    recentOrders: [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)
  };
}

/* ---------------------------------------------------------- reset / seed  */

/** Reload every table from the shipped seed JSON (admin "reset demo data"). */
export async function reseed() {
  const customers = [];
  for (const c of seedCustomers) {
    const { password, ...rest } = c;
    customers.push({ ...rest, passwordHash: await hashPassword(password || 'demo1234') });
  }

  const seed = {
    products: seedProducts,
    categories: seedCategories,
    orders: seedOrders,
    customers,
    reviews: seedReviews,
    posts: seedPosts,
    coupons: seedCoupons,
    messages: [],
    subscribers: []
  };

  for (const name of COLLECTIONS) {
    await sql.query(`DELETE FROM ${name}`);
    for (const row of seed[name]) {
      const { id, ...data } = row;
      await sql.query(`INSERT INTO ${name} (id, data) VALUES ($1, $2)`, [Number(id), JSON.stringify(data)]);
    }
  }

  const { admin, ...rest } = seedSettings;
  await saveSettingsRow({
    ...rest,
    admin: {
      email: admin.email,
      name: admin.name,
      passwordHash: await hashPassword(admin.password || 'adelaide2026')
    }
  });
  return true;
}
