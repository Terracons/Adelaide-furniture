/**
 * ============================================================================
 *  Neon Postgres client + generic collection helpers.  SERVER ONLY.
 * ============================================================================
 *  Each collection is one table shaped as (id INTEGER PK, data JSONB). Rows are
 *  returned as plain objects { id, ...data } so the app's existing logic keeps
 *  working unchanged. This document-in-Postgres model keeps the migration
 *  contained; split hot fields into real columns later if a table grows.
 *
 *  Imported only by API route handlers (src/app/api/*) and scripts/seed.mjs —
 *  never by client components.
 * ============================================================================
 */
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  // Fail loudly at first use rather than silently returning empty data.
  console.warn('[db] DATABASE_URL is not set — API routes will error until it is.');
}

// A syntactically valid placeholder lets the module import during build (when
// DATABASE_URL may be unset) without connecting. Real queries fail loudly at
// request time if the true URL is missing.
export const sql = neon(process.env.DATABASE_URL || 'postgresql://user:pass@localhost/placeholder');

/** Collections that may be addressed by name (guards against injection). */
export const COLLECTIONS = new Set([
  'products', 'categories', 'orders', 'customers', 'reviews',
  'posts', 'coupons', 'messages', 'subscribers'
]);

function assertName(name) {
  if (!COLLECTIONS.has(name)) throw new Error(`Unknown collection: ${name}`);
  return name;
}

const shape = (row) => ({ id: row.id, ...row.data });

/** Every row in a collection, oldest id first. */
export async function collection(name) {
  const rows = await sql.query(`SELECT id, data FROM ${assertName(name)} ORDER BY id ASC`);
  return rows.map(shape);
}

export async function findById(name, id) {
  const rows = await sql.query(
    `SELECT id, data FROM ${assertName(name)} WHERE id = $1`, [Number(id)]
  );
  return rows[0] ? shape(rows[0]) : null;
}

async function nextId(name) {
  const rows = await sql.query(`SELECT COALESCE(MAX(id), 0) + 1 AS id FROM ${assertName(name)}`);
  return rows[0].id;
}

/** Insert a new row. Uses obj.id if given, otherwise auto-increments. */
export async function insertRow(name, obj) {
  assertName(name);
  const { id: givenId, ...rest } = obj;
  const id = givenId != null ? Number(givenId) : await nextId(name);
  await sql.query(`INSERT INTO ${name} (id, data) VALUES ($1, $2)`, [id, JSON.stringify(rest)]);
  return { id, ...rest };
}

/** Shallow-merge a patch into an existing row's data. */
export async function updateRow(name, id, patch) {
  const current = await findById(name, id);
  if (!current) return null;
  const { id: _drop, ...rest } = { ...current, ...patch };
  await sql.query(`UPDATE ${assertName(name)} SET data = $2 WHERE id = $1`,
    [Number(id), JSON.stringify(rest)]);
  return { id: Number(id), ...rest };
}

/** Replace a whole row's data (used when the caller already merged). */
export async function putRow(name, id, obj) {
  const { id: _drop, ...rest } = obj;
  await sql.query(`UPDATE ${assertName(name)} SET data = $2 WHERE id = $1`,
    [Number(id), JSON.stringify(rest)]);
  return { id: Number(id), ...rest };
}

export async function deleteRow(name, id) {
  await sql.query(`DELETE FROM ${assertName(name)} WHERE id = $1`, [Number(id)]);
  return true;
}

/* --------------------------------------------------------- settings singleton */
/*  settings lives in its own table with a single row (id = 1). The `admin`
    field holds { email, passwordHash } and is stripped before reaching the
    client — see getPublicSettings() in queries.js.                            */

export async function getSettingsRow() {
  const rows = await sql.query(`SELECT data FROM settings WHERE id = 1`);
  return rows[0]?.data || null;
}

export async function saveSettingsRow(data) {
  await sql.query(
    `INSERT INTO settings (id, data) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET data = $1`,
    [JSON.stringify(data)]
  );
  return data;
}
