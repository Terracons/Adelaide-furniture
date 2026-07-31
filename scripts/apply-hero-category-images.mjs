/**
 * One-off: source nice CC0 interior/room photos (StockSnap via Openverse) for
 * the hero slides and the 8 category tiles. Updates categories.json + the live
 * DB, and prints the 3 hero URLs to paste into Hero.jsx.
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
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const used = new Set();

async function ov(term) {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(term)}&source=stocksnap&license=cc0&page_size=15&aspect_ratio=wide&mature=false`;
  for (let a = 0; a < 4; a++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.ok) return (await r.json()).results || [];
    if ([403, 429, 500, 502, 503].includes(r.status)) { await sleep(1500 * (a + 1)); continue; }
    return [];
  }
  return [];
}
async function loads(u) { try { const r = await fetch(u, { headers: { 'User-Agent': UA, Range: 'bytes=0-4096' } }); return (r.status === 200 || r.status === 206) && (r.headers.get('content-type') || '').startsWith('image/'); } catch { return false; } }

async function pick(terms) {
  for (const t of terms) {
    for (const r of await ov(t)) {
      const u = r.url || '';
      if (!/\.(jpg|jpeg|png)$/i.test(u) || used.has(u)) continue;
      if (await loads(u)) { used.add(u); return u; }
    }
    await sleep(1200);
  }
  return null;
}

// Hero slides (order matches SLIDES in Hero.jsx: living, bedroom, dining).
const hero = {};
hero.living = await pick(['living room interior modern', 'living room sofa', 'modern living room']);
hero.bedroom = await pick(['bedroom interior modern', 'bedroom bed', 'cozy bedroom']);
hero.dining = await pick(['dining room interior', 'dining table room', 'dining area']);

// Category tiles.
const CAT_TERMS = {
  sofas: ['living room sofa', 'modern sofa interior'],
  chairs: ['armchair interior', 'accent chair', 'lounge chair'],
  tables: ['dining table wood', 'wooden table interior'],
  beds: ['bedroom bed', 'bedroom interior'],
  lighting: ['lamp interior light', 'floor lamp room'],
  storage: ['shelf interior', 'bookshelf', 'cabinet interior'],
  decor: ['home decor interior', 'living room decor'],
  outdoor: ['patio furniture', 'garden furniture outdoor']
};

const categories = JSON.parse(readFileSync(join(root, 'src/data/categories.json'), 'utf8'));
const catMap = {};
for (const c of categories) {
  const img = await pick(CAT_TERMS[c.slug] || [c.slug]);
  if (img) { c.image = img; catMap[c.slug] = img; console.log(`  ✓ category ${c.slug}`); }
  else console.log(`  ✗ category ${c.slug}: none`);
}
writeFileSync(join(root, 'src/data/categories.json'), JSON.stringify(categories, null, 2) + '\n');

if (process.env.DATABASE_URL) {
  const sql = neon(process.env.DATABASE_URL);
  for (const [slug, image] of Object.entries(catMap)) {
    await sql.query(`UPDATE categories SET data = data || $2::jsonb WHERE data->>'slug' = $1`, [slug, JSON.stringify({ image })]);
  }
  console.log(`→ database updated: ${Object.keys(catMap).length} categories.`);
}

console.log('\n=== HERO URLS (paste into Hero.jsx) ===');
console.log('living :', hero.living);
console.log('bedroom:', hero.bedroom);
console.log('dining :', hero.dining);
