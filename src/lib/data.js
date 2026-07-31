/**
 * ============================================================================
 *  THE DATA LAYER  -  the only file that knows where data comes from.
 * ============================================================================
 *  Every page and component talks to the app through the async functions
 *  below. Right now they read seed JSON and persist changes to localStorage.
 *
 *  To move to a real backend (Node + MySQL, or PHP + MySQL) you rewrite the
 *  bodies of these functions to `fetch('/api/...')`. The signatures stay the
 *  same, so nothing else in the codebase changes. See MIGRATE-TO-SERVER.md.
 * ============================================================================
 */

import { read, write, nextId, isBrowser } from './store';
import { slugify } from './format';

import seedProducts from '@/data/products.json';
import seedCategories from '@/data/categories.json';
import seedOrders from '@/data/orders.json';
import seedCustomers from '@/data/customers.json';
import seedReviews from '@/data/reviews.json';
import seedPosts from '@/data/posts.json';
import seedCoupons from '@/data/coupons.json';
import seedTestimonials from '@/data/testimonials.json';
import seedFaqs from '@/data/faqs.json';
import seedSettings from '@/data/settings.json';

const SEED = {
  products: seedProducts,
  categories: seedCategories,
  orders: seedOrders,
  customers: seedCustomers,
  reviews: seedReviews,
  posts: seedPosts,
  coupons: seedCoupons,
  messages: [],
  subscribers: []
};

/* -------------------------------------------------------------- internals */

const clone = (v) => JSON.parse(JSON.stringify(v));

/** Read a collection: localStorage override if present, otherwise seed. */
function table(name) {
  const seed = SEED[name] || [];
  if (!isBrowser) return clone(seed);
  const rows = read('db:' + name, null);
  return Array.isArray(rows) ? rows : clone(seed);
}

/** Persist a collection. */
function persist(name, rows) {
  write('db:' + name, rows);
  return rows;
}

const byId = (rows, id) => rows.find((r) => String(r.id) === String(id)) || null;

/* -------------------------------------------------------------- settings  */

export async function getSettings() {
  const stored = isBrowser ? read('db:settings', null) : null;
  return { ...clone(seedSettings), ...(stored || {}) };
}

export async function saveSettings(patch) {
  const current = await getSettings();
  const next = { ...current, ...patch };
  write('db:settings', next);
  return next;
}

export async function getTestimonials() {
  return clone(seedTestimonials);
}

export async function getFaqs() {
  return clone(seedFaqs);
}

/* ------------------------------------------------------------ categories  */

export async function getCategories() {
  const cats = table('categories');
  const products = table('products');
  return cats.map((c) => ({
    ...c,
    count: products.filter((p) => p.category === c.slug && p.status === 'published').length
  }));
}

export async function getCategory(slug) {
  const cats = await getCategories();
  return cats.find((c) => c.slug === slug) || null;
}

export async function saveCategory(input) {
  const rows = table('categories');
  const data = { ...input, slug: input.slug || slugify(input.name) };
  if (data.id) {
    const i = rows.findIndex((r) => String(r.id) === String(data.id));
    if (i > -1) rows[i] = { ...rows[i], ...data };
  } else {
    rows.push({ ...data, id: nextId(rows), image: data.image || '/images/categories/decor.svg' });
  }
  persist('categories', rows);
  return data;
}

export async function deleteCategory(id) {
  persist('categories', table('categories').filter((r) => String(r.id) !== String(id)));
  return true;
}

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

/**
 * @param {object} opts category | search | minPrice | maxPrice | colors[] |
 *                      sort | page | perPage | featured | isNew | bestseller |
 *                      status | inStock
 * @returns {{items:array,total:number,pages:number,page:number}}
 */
export async function getProducts(opts = {}) {
  const {
    category, search, minPrice, maxPrice, colors, sort = 'featured',
    page = 1, perPage = 12, featured, isNew, bestseller,
    status = 'published', inStock
  } = opts;

  let items = table('products');

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

export async function getAllProducts() {
  return table('products');
}

export async function getProduct(slug) {
  return table('products').find((p) => p.slug === slug) || null;
}

export async function getProductById(id) {
  return byId(table('products'), id);
}

export async function getRelatedProducts(product, limit = 4) {
  if (!product) return [];
  const all = table('products').filter((p) => p.id !== product.id && p.status === 'published');
  const same = all.filter((p) => p.category === product.category);
  const rest = all.filter((p) => p.category !== product.category);
  return [...same, ...rest].slice(0, limit);
}

export async function searchProducts(term, limit = 6) {
  const { items } = await getProducts({ search: term, perPage: limit, sort: 'rating' });
  return items;
}

export async function saveProduct(input) {
  const rows = table('products');
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
    const i = rows.findIndex((r) => String(r.id) === String(input.id));
    if (i > -1) rows[i] = { ...rows[i], ...base, updatedAt: new Date().toISOString() };
  } else {
    const id = nextId(rows);
    const image = base.image || '/images/products/sena-ribbed-vase-1.svg';
    rows.unshift({
      id,
      ...base,
      image,
      gallery: base.gallery && base.gallery.length ? base.gallery : [image],
      createdAt: new Date().toISOString().slice(0, 10),
      status: base.status || 'published'
    });
  }
  persist('products', rows);
  return base;
}

export async function deleteProduct(id) {
  persist('products', table('products').filter((r) => String(r.id) !== String(id)));
  return true;
}

/** Distinct colour swatches across the catalogue - used by the shop filters. */
export async function getFilterOptions() {
  const items = table('products').filter((p) => p.status === 'published');
  const colors = [...new Set(items.flatMap((p) => p.colors || []))].sort();
  const prices = items.map((p) => p.price);
  return {
    colors,
    minPrice: Math.min(...prices, 0),
    maxPrice: Math.max(...prices, 5000)
  };
}

/* --------------------------------------------------------------- reviews  */

export async function getReviews({ productId, status = 'approved', limit } = {}) {
  let rows = table('reviews');
  if (productId != null) rows = rows.filter((r) => String(r.productId) === String(productId));
  if (status !== 'all') rows = rows.filter((r) => r.status === status);
  rows = rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return limit ? rows.slice(0, limit) : rows;
}

export async function addReview(input) {
  const rows = table('reviews');
  const row = {
    id: nextId(rows),
    status: 'pending',
    createdAt: new Date().toISOString().slice(0, 10),
    ...input,
    rating: Number(input.rating) || 5
  };
  rows.unshift(row);
  persist('reviews', rows);
  return row;
}

export async function updateReview(id, patch) {
  const rows = table('reviews');
  const i = rows.findIndex((r) => String(r.id) === String(id));
  if (i > -1) rows[i] = { ...rows[i], ...patch };
  persist('reviews', rows);
  return rows[i] || null;
}

export async function deleteReview(id) {
  persist('reviews', table('reviews').filter((r) => String(r.id) !== String(id)));
  return true;
}

/* ------------------------------------------------------------------ blog  */

export async function getPosts({ status = 'published', limit, featured, tag } = {}) {
  let rows = table('posts');
  if (status !== 'all') rows = rows.filter((p) => (p.status || 'published') === status);
  if (featured) rows = rows.filter((p) => p.featured);
  if (tag) rows = rows.filter((p) => (p.tags || []).includes(tag));
  rows = rows.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  return limit ? rows.slice(0, limit) : rows;
}

export async function getPost(slug) {
  return table('posts').find((p) => p.slug === slug) || null;
}

export async function savePost(input) {
  const rows = table('posts');
  const data = { ...input, slug: input.slug || slugify(input.title) };
  if (data.id) {
    const i = rows.findIndex((r) => String(r.id) === String(data.id));
    if (i > -1) rows[i] = { ...rows[i], ...data };
  } else {
    rows.unshift({
      id: nextId(rows),
      cover: '/images/blog/post-1.svg',
      author: 'Adelaide Studio',
      readTime: 5,
      publishedAt: new Date().toISOString().slice(0, 10),
      status: 'published',
      tags: [],
      ...data
    });
  }
  persist('posts', rows);
  return data;
}

export async function deletePost(id) {
  persist('posts', table('posts').filter((r) => String(r.id) !== String(id)));
  return true;
}

/* --------------------------------------------------------------- coupons  */

export async function getCoupons() {
  return table('coupons');
}

/** @returns {{valid:boolean, message:string, discount:number, coupon?:object}} */
export async function validateCoupon(code, subtotal) {
  const rows = table('coupons');
  const c = rows.find((r) => r.code.toLowerCase() === String(code || '').trim().toLowerCase());

  if (!c) return { valid: false, message: 'That code is not recognised.', discount: 0 };
  if (!c.active) return { valid: false, message: 'That code is no longer active.', discount: 0 };
  if (c.expiresAt && new Date(c.expiresAt) < new Date())
    return { valid: false, message: 'That code has expired.', discount: 0 };
  if (c.usageLimit > 0 && c.usedCount >= c.usageLimit)
    return { valid: false, message: 'That code has been fully redeemed.', discount: 0 };
  if (subtotal < c.minSpend)
    return {
      valid: false,
      discount: 0,
      message: `Spend at least $${c.minSpend.toLocaleString()} to use this code.`
    };

  const discount =
    c.type === 'percent'
      ? Math.round(subtotal * (c.value / 100) * 100) / 100
      : Math.min(c.value, subtotal);

  return { valid: true, message: `${c.code} applied.`, discount, coupon: c };
}

export async function saveCoupon(input) {
  const rows = table('coupons');
  const data = {
    ...input,
    code: String(input.code || '').toUpperCase().trim(),
    value: Number(input.value) || 0,
    minSpend: Number(input.minSpend) || 0,
    usageLimit: Number(input.usageLimit) || 0
  };
  if (data.id) {
    const i = rows.findIndex((r) => String(r.id) === String(data.id));
    if (i > -1) rows[i] = { ...rows[i], ...data };
  } else {
    rows.unshift({ id: nextId(rows), usedCount: 0, active: true, ...data });
  }
  persist('coupons', rows);
  return data;
}

export async function deleteCoupon(id) {
  persist('coupons', table('coupons').filter((r) => String(r.id) !== String(id)));
  return true;
}

/* ---------------------------------------------------------------- orders  */

export async function getOrders({ status, search, userId, limit } = {}) {
  let rows = table('orders');
  if (status && status !== 'all') rows = rows.filter((o) => o.status === status);
  if (userId != null) rows = rows.filter((o) => String(o.userId) === String(userId));
  if (search) {
    const q = String(search).toLowerCase();
    rows = rows.filter((o) =>
      [o.orderNumber, o.customerName, o.customerEmail, o.city].join(' ').toLowerCase().includes(q)
    );
  }
  rows = rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt) || b.id - a.id);
  return limit ? rows.slice(0, limit) : rows;
}

export async function getOrder(idOrNumber) {
  const rows = table('orders');
  return (
    rows.find((o) => String(o.id) === String(idOrNumber)) ||
    rows.find((o) => o.orderNumber === idOrNumber) ||
    null
  );
}

export async function createOrder(payload) {
  const rows = table('orders');
  const id = nextId(rows);
  const order = {
    id,
    orderNumber: 'ADL-' + String(30000 + id * 13),
    createdAt: new Date().toISOString().slice(0, 10),
    status: 'pending',
    paymentStatus: payload.paymentMethod === 'Bank transfer' ? 'pending' : 'paid',
    country: 'Australia',
    ...payload
  };
  rows.unshift(order);
  persist('orders', rows);

  // decrement stock so the catalogue stays believable
  const products = table('products');
  (order.items || []).forEach((item) => {
    const p = products.find((x) => String(x.id) === String(item.productId));
    if (p) p.stock = Math.max(0, p.stock - item.quantity);
  });
  persist('products', products);

  // count the coupon redemption
  if (order.couponCode) {
    const coupons = table('coupons');
    const c = coupons.find((x) => x.code === order.couponCode);
    if (c) c.usedCount = (c.usedCount || 0) + 1;
    persist('coupons', coupons);
  }

  return order;
}

export async function updateOrder(id, patch) {
  const rows = table('orders');
  const i = rows.findIndex((o) => String(o.id) === String(id));
  if (i > -1) rows[i] = { ...rows[i], ...patch, updatedAt: new Date().toISOString() };
  persist('orders', rows);
  return rows[i] || null;
}

export async function deleteOrder(id) {
  persist('orders', table('orders').filter((r) => String(r.id) !== String(id)));
  return true;
}

/* ------------------------------------------------------------- customers  */

export async function getCustomers({ search } = {}) {
  let rows = table('customers');
  const orders = table('orders');
  rows = rows.map((c) => {
    const mine = orders.filter((o) => String(o.userId) === String(c.id));
    return {
      ...c,
      orderCount: mine.length,
      totalSpent: mine.reduce((sum, o) => sum + (o.status === 'cancelled' ? 0 : o.total), 0),
      lastOrder: mine.length
        ? mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt
        : null
    };
  });
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter((c) => [c.name, c.email, c.city].join(' ').toLowerCase().includes(q));
  }
  return rows.sort((a, b) => b.totalSpent - a.totalSpent);
}

export async function getCustomer(id) {
  const rows = await getCustomers();
  return byId(rows, id);
}

export async function saveCustomer(input) {
  const rows = table('customers');
  if (input.id) {
    const i = rows.findIndex((r) => String(r.id) === String(input.id));
    if (i > -1) rows[i] = { ...rows[i], ...input };
  } else {
    rows.unshift({
      id: nextId(rows),
      role: 'customer',
      status: 'active',
      country: 'Australia',
      createdAt: new Date().toISOString().slice(0, 10),
      ...input
    });
  }
  persist('customers', rows);
  return input;
}

export async function deleteCustomer(id) {
  persist('customers', table('customers').filter((r) => String(r.id) !== String(id)));
  return true;
}

/* ------------------------------------------------------------------ auth  */
/*  Demo-grade only: this is a static site, so there is no server to verify
    a password against. Treat it as a UI demonstration, not real security.
    MIGRATE-TO-SERVER.md explains how to swap in real sessions.             */

export async function registerCustomer({ name, email, password, ...rest }) {
  const rows = table('customers');
  if (rows.some((c) => c.email.toLowerCase() === String(email).toLowerCase()))
    return { ok: false, message: 'An account with that email already exists.' };

  const user = {
    id: nextId(rows),
    name, email, password,
    role: 'customer',
    status: 'active',
    country: 'Australia',
    createdAt: new Date().toISOString().slice(0, 10),
    ...rest
  };
  rows.unshift(user);
  persist('customers', rows);
  return { ok: true, user };
}

export async function loginCustomer(email, password) {
  const user = table('customers').find(
    (c) => c.email.toLowerCase() === String(email).toLowerCase()
  );
  if (!user) return { ok: false, message: 'No account found with that email.' };
  if (user.password !== password) return { ok: false, message: 'That password is not correct.' };
  if (user.status === 'blocked') return { ok: false, message: 'This account has been suspended.' };
  return { ok: true, user };
}

export async function adminLogin(email, password) {
  const settings = await getSettings();
  const a = settings.admin || {};
  if (
    String(email).toLowerCase() === String(a.email).toLowerCase() &&
    password === a.password
  ) {
    return { ok: true, user: { name: a.name, email: a.email, role: 'admin' } };
  }
  return { ok: false, message: 'Those admin credentials are not correct.' };
}

/* -------------------------------------------------------------- messages  */

export async function sendMessage(input) {
  const rows = table('messages');
  const row = {
    id: nextId(rows),
    isRead: false,
    createdAt: new Date().toISOString(),
    ...input
  };
  rows.unshift(row);
  persist('messages', rows);
  return row;
}

export async function getMessages() {
  return table('messages');
}

export async function updateMessage(id, patch) {
  const rows = table('messages');
  const i = rows.findIndex((r) => String(r.id) === String(id));
  if (i > -1) rows[i] = { ...rows[i], ...patch };
  persist('messages', rows);
  return rows[i] || null;
}

export async function deleteMessage(id) {
  persist('messages', table('messages').filter((r) => String(r.id) !== String(id)));
  return true;
}

export async function subscribeEmail(email) {
  const rows = table('subscribers');
  if (rows.some((s) => s.email.toLowerCase() === String(email).toLowerCase()))
    return { ok: true, message: "You're already on the list." };
  rows.unshift({ id: nextId(rows), email, createdAt: new Date().toISOString() });
  persist('subscribers', rows);
  return { ok: true, message: 'Thanks - check your inbox for a welcome note.' };
}

export async function getSubscribers() {
  return table('subscribers');
}

/* ------------------------------------------------------------ dashboard   */

export async function getStats() {
  const orders = table('orders');
  const products = table('products');
  const customers = table('customers');
  const reviews = table('reviews');

  const live = orders.filter((o) => o.status !== 'cancelled');
  const revenue = live.reduce((s, o) => s + o.total, 0);
  const units = live.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0);

  // revenue by month for the chart
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

  // best sellers
  const tally = {};
  live.forEach((o) =>
    o.items.forEach((i) => {
      tally[i.productId] = (tally[i.productId] || 0) + i.quantity;
    })
  );
  const topProducts = Object.entries(tally)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, qty]) => {
      const p = products.find((x) => String(x.id) === String(id));
      return { id, qty, name: p?.name || 'Removed product', image: p?.image, revenue: (p?.price || 0) * qty };
    });

  const byCategory = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

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
    recentOrders: [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
  };
}

/** Wipe every local override and go back to the shipped seed data. */
export async function resetDemoData() {
  ['products', 'categories', 'orders', 'customers', 'reviews', 'posts', 'coupons', 'messages', 'subscribers', 'settings']
    .forEach((name) => write('db:' + name, null));
  if (isBrowser) {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith('adelaide:db:'))
      .forEach((k) => window.localStorage.removeItem(k));
  }
  return true;
}
