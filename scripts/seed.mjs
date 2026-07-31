/**
 * Seed Neon from the shipped src/data/*.json.
 *
 *   node scripts/seed.mjs            # create tables + load seed data
 *   node scripts/seed.mjs --reset    # DROP tables first, then reload
 *
 * Reads DATABASE_URL from the environment (.env.local is loaded automatically).
 * Customer + admin passwords are bcrypt-hashed on the way in.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Load .env.local / .env if present (no dependency on dotenv).
for (const file of ['.env.local', '.env']) {
  try {
    for (const line of readFileSync(join(root, file), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* file optional */ }
}

if (!process.env.DATABASE_URL) {
  console.error('✗ DATABASE_URL is not set. Add it to .env.local first.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const reset = process.argv.includes('--reset');

const read = (name) => JSON.parse(readFileSync(join(root, 'src/data', `${name}.json`), 'utf8'));

const COLLECTIONS = [
  'products', 'categories', 'orders', 'customers', 'reviews',
  'posts', 'coupons', 'messages', 'subscribers'
];

async function run() {
  console.log('→ Applying schema…');
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  for (const stmt of schema.split(';').map((s) => s.trim()).filter(Boolean)) {
    await sql.query(stmt);
  }

  if (reset) {
    console.log('→ Resetting tables…');
    for (const t of [...COLLECTIONS, 'settings']) await sql.query(`TRUNCATE ${t}`);
  }

  // Hash customer passwords.
  const customers = read('customers');
  for (const c of customers) {
    c.passwordHash = await bcrypt.hash(String(c.password || 'demo1234'), 10);
    delete c.password;
  }

  // messages/subscribers ship empty.
  const seedData = {
    products: read('products'),
    categories: read('categories'),
    orders: read('orders'),
    customers,
    reviews: read('reviews'),
    posts: read('posts'),
    coupons: read('coupons'),
    messages: [],
    subscribers: []
  };

  for (const name of COLLECTIONS) {
    const rows = seedData[name];
    await sql.query(`DELETE FROM ${name}`);
    for (const row of rows) {
      const { id, ...rest } = row;
      await sql.query(`INSERT INTO ${name} (id, data) VALUES ($1, $2)`,
        [Number(id), JSON.stringify(rest)]);
    }
    console.log(`  ✓ ${name}: ${rows.length}`);
  }

  // Settings singleton — hash the admin password, drop the plaintext.
  const settings = read('settings');
  const admin = settings.admin || {};
  settings.admin = {
    email: admin.email,
    name: admin.name,
    passwordHash: await bcrypt.hash(String(admin.password || 'adelaide2026'), 10)
  };
  await sql.query(
    `INSERT INTO settings (id, data) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET data = $1`,
    [JSON.stringify(settings)]
  );
  console.log('  ✓ settings: 1');

  console.log('\n✓ Seed complete.');
}

run().catch((err) => {
  console.error('\n✗ Seed failed:', err.message);
  process.exit(1);
});
