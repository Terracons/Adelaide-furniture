/**
 * One-off: strip em/en-dashes and dash-style hyphens from the copy in the seed
 * JSON, replacing them with natural punctuation, then push the cleaned text to
 * the live database. Compound/range hyphens (ten-year, Mon-Sat, ADL-1000, image
 * URLs) are left alone because they have no surrounding spaces.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { neon } from '@neondatabase/serverless';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
for (const f of ['.env.local', '.env']) {
  try { for (const l of readFileSync(join(root, f), 'utf8').split('\n')) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  } } catch {}
}

/** Replace dash punctuation in a copy string with natural punctuation. */
function clean(s) {
  if (typeof s !== 'string') return s;
  let out = s
    .replace(/\s*[—–]\s*/g, ', ') // em/en dash -> comma
    .replace(/ - /g, ', ')                  // spaced hyphen used as a dash -> comma
    .replace(/ {2,}/g, ' ')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/,\s*\./g, '.')
    .replace(/,\s*(<\/p>|<\/li>|<\/h2>)/g, '$1'); // comma stranded before a closing tag
  return out.trimStart().replace(/^,\s*/, '');
}

function deepClean(v) {
  if (typeof v === 'string') return clean(v);
  if (Array.isArray(v)) return v.map(deepClean);
  if (v && typeof v === 'object') {
    const o = {};
    for (const [k, val] of Object.entries(v)) o[k] = deepClean(val);
    return o;
  }
  return v;
}

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

async function processCollection(name, { table, byId = true }) {
  const file = join(root, 'src/data', `${name}.json`);
  const rows = JSON.parse(readFileSync(file, 'utf8'));
  const cleaned = rows.map(deepClean);
  writeFileSync(file, JSON.stringify(cleaned, null, 2) + '\n');
  if (sql && table) {
    for (const row of cleaned) {
      const { id, ...data } = row;
      await sql.query(`UPDATE ${table} SET data = $2::jsonb WHERE id = $1`, [Number(id), JSON.stringify(data)]);
    }
  }
  console.log(`  ✓ ${name}: ${cleaned.length} rows cleaned${sql && table ? ' + DB updated' : ''}`);
}

// Array collections that live in the DB.
await processCollection('products', { table: 'products' });
await processCollection('posts', { table: 'posts' });
await processCollection('coupons', { table: 'coupons' });
await processCollection('reviews', { table: 'reviews' });
// Static JSON read directly by data.js (not in DB).
await processCollection('testimonials', {});
await processCollection('faqs', {});

// Settings singleton: clean the copy but keep the DB's hashed admin creds.
{
  const file = join(root, 'src/data/settings.json');
  const s = JSON.parse(readFileSync(file, 'utf8'));
  const { admin, ...rest } = s;
  const cleanedRest = deepClean(rest);
  writeFileSync(file, JSON.stringify({ ...cleanedRest, admin }, null, 2) + '\n');
  if (sql) {
    const cur = (await sql.query(`SELECT data FROM settings WHERE id = 1`))[0]?.data || {};
    const next = { ...cur, ...cleanedRest }; // preserve cur.admin (hashed)
    await sql.query(`UPDATE settings SET data = $1::jsonb WHERE id = 1`, [JSON.stringify(next)]);
  }
  console.log('  ✓ settings: cleaned + DB updated (admin preserved)');
}

console.log('\n✓ Done.');
