/**
 * Tiny localStorage-backed store.
 *
 * Everything the app writes (admin edits, orders, accounts, cart) lands here.
 * On the server (during `next build`) every read falls through to the seed
 * data passed in, so static pages are generated from src/data/*.json.
 *
 * When you move to a real backend you do NOT touch this file - you rewrite
 * src/lib/data.js to call your API instead. See MIGRATE-TO-SERVER.md.
 */

const PREFIX = 'adelaide:';
export const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const listeners = new Set();

export function read(key, fallback) {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null || raw === undefined || raw === 'undefined') return fallback;
    const parsed = JSON.parse(raw);
    // A stored `null` means "cleared" - fall back to the seed rather than
    // handing callers a null they would have to guard against.
    return parsed === null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  if (!isBrowser) return value;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn('[store] could not persist', key, err);
  }
  emit(key);
  return value;
}

export function remove(key) {
  if (!isBrowser) return;
  window.localStorage.removeItem(PREFIX + key);
  emit(key);
}

export function clearAll() {
  if (!isBrowser) return;
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => window.localStorage.removeItem(k));
  emit('*');
}

function emit(key) {
  listeners.forEach((fn) => {
    try {
      fn(key);
    } catch {
      /* a broken listener must not break the others */
    }
  });
  if (isBrowser) window.dispatchEvent(new CustomEvent('adelaide:store', { detail: { key } }));
}

/** Subscribe to any store change. Returns an unsubscribe function. */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Nudge every subscriber — used after a server mutation so useData refreshes. */
export function touch() {
  emit('*');
}

/** Next auto-increment id for a collection. */
export function nextId(rows) {
  return rows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
}
