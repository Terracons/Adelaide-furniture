/**
 * One-off: pull real, CC0-licensed furniture photos (StockSnap, via the
 * Openverse API) and assign a hero + gallery to every product. Updates both
 * src/data/products.json (source of truth) and the live Neon database.
 *
 *   node scripts/apply-stock-images.mjs
 *
 * CC0 = public domain, free for commercial use, no attribution required.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { neon } from '@neondatabase/serverless';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

for (const file of ['.env.local', '.env']) {
  try {
    for (const line of readFileSync(join(root, file), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* optional */ }
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Tailored search terms per product (first that yields enough images wins).
const TERMS = {
  'adelaide-deep-seat-sofa': ['sofa', 'couch living room'],
  'harlow-3-seater-lounge': ['couch living room', 'sofa'],
  'brixton-modular-corner': ['sectional sofa', 'sofa living room'],
  'marlowe-loveseat': ['loveseat', 'sofa'],
  'elna-curved-armchair': ['accent chair', 'armchair', 'chair'],
  'sloan-wingback-chair': ['armchair', 'lounge chair', 'chair'],
  'norra-dining-chair': ['dining chair', 'chair'],
  'pia-cane-dining-chair': ['wooden chair', 'chair'],
  'ravello-oak-dining-table': ['dining table', 'wooden table'],
  'vero-round-dining-table': ['round table', 'dining table'],
  'otto-travertine-coffee-table': ['coffee table', 'living room table'],
  'linden-oval-coffee-table': ['coffee table living room', 'coffee table'],
  'halden-upholstered-bed': ['bed bedroom', 'bedroom'],
  'fable-rattan-bed-frame': ['bed frame bedroom', 'bedroom bed'],
  'ida-bedside-table': ['nightstand', 'bedside table', 'bedroom'],
  'aurea-brass-pendant': ['pendant light', 'hanging lamp'],
  'sila-arc-floor-lamp': ['floor lamp', 'lamp'],
  'nova-ceramic-table-lamp': ['table lamp', 'lamp'],
  'kessler-oak-sideboard': ['sideboard', 'cabinet furniture'],
  'atlas-open-shelving': ['bookshelf', 'shelves books'],
  'cove-3-door-wardrobe': ['wardrobe', 'closet'],
  'merrow-writing-desk': ['desk workspace', 'desk'],
  'juno-boucle-ottoman': ['ottoman', 'footstool'],
  'halo-arch-mirror': ['mirror wall', 'mirror'],
  'tessa-handknotted-rug': ['rug carpet', 'rug'],
  'sena-ribbed-vase': ['vase', 'ceramic vase'],
  'coast-outdoor-lounge-chair': ['outdoor chair patio', 'patio furniture'],
  'dune-teak-bench': ['garden bench', 'wooden bench outdoor']
};

async function openverse(term) {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(term)}` +
    `&source=stocksnap&license=cc0&page_size=15&mature=false`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return (await res.json()).results || [];
    if ([403, 429, 500, 502, 503].includes(res.status)) { await sleep(1500 * (attempt + 1)); continue; }
    return [];
  }
  return [];
}

async function loads(u) {
  try {
    const res = await fetch(u, { headers: { 'User-Agent': UA, Range: 'bytes=0-4096' } });
    return (res.status === 200 || res.status === 206) &&
      (res.headers.get('content-type') || '').startsWith('image/');
  } catch { return false; }
}

const products = JSON.parse(readFileSync(join(root, 'src/data/products.json'), 'utf8'));
const used = new Set();
const map = {};

for (const p of products) {
  const terms = TERMS[p.slug] || [p.category];
  const picks = [];
  for (const term of terms) {
    if (picks.length >= 4) break;
    const results = await openverse(term);
    await sleep(1200); // be gentle with the anonymous API
    for (const r of results) {
      if (picks.length >= 4) break;
      const u = r.url || '';
      if (!/\.(jpg|jpeg|png)$/i.test(u)) continue;
      if (used.has(u) || picks.includes(u)) continue;
      if (await loads(u)) { picks.push(u); used.add(u); }
    }
  }
  if (picks.length === 0) { console.log(`  ✗ ${p.slug}: no image found`); continue; }
  p.image = picks[0];
  p.gallery = picks;
  map[p.slug] = { image: picks[0], gallery: picks };
  console.log(`  ✓ ${p.slug}: ${picks.length} image(s)`);
}

writeFileSync(join(root, 'src/data/products.json'), JSON.stringify(products, null, 2) + '\n');
console.log('\n→ products.json updated.');

// Push to the live database.
if (process.env.DATABASE_URL) {
  const sql = neon(process.env.DATABASE_URL);
  let n = 0;
  for (const [slug, imgs] of Object.entries(map)) {
    await sql.query(
      `UPDATE products SET data = data || $2::jsonb WHERE data->>'slug' = $1`,
      [slug, JSON.stringify(imgs)]
    );
    n++;
  }
  console.log(`→ database updated: ${n} products.`);
} else {
  console.log('→ DATABASE_URL not set; skipped DB update.');
}
