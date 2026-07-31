# Growing out of static: adding a real backend

The site was built so this is a contained job rather than a rewrite.

**Everything stays:** all pages, all components, the design system, cart and wishlist logic,
every admin screen, all forms and routing. That is roughly 85% of the codebase.

**What changes:** `src/lib/data.js`, plus new API endpoints and real password handling.

The reason it is contained: every page already calls `async` functions from `data.js` and
awaits the result. Whether that function reads a JSON file or does a database query is
invisible to the caller.

```js
// Pages call this today and will still call exactly this afterwards:
const { items, total } = await getProducts({ category: 'sofas', page: 2 });
```

---

## Pick a route

| | Effort | Cost | You get |
|---|---|---|---|
| **A. PHP + MySQL** on your existing Hostinger plan | ~1 day | $0 extra | Real database, persistent admin, no new hosting |
| **B. Next.js + MySQL** on a Hostinger VPS | ~1 day | ~$5–8/mo | Server rendering, real SEO, one language |
| **C. Supabase** + keep the static frontend | ~half a day | Free tier | Managed Postgres, real auth, file storage |

Option A keeps you on the hosting you already pay for. Option C is fastest. Option B is the
nicest codebase.

> **Route D — Vercel + Neon + Vercel Blob is implemented on the `feat/neon-backend` branch.**
> See the runbook at the end of this file. It's Route B done serverless: no VPS to manage.

---

## Route A — PHP API on Hostinger shared hosting

Shared hosting cannot run Node, but it runs PHP and MySQL. The static frontend stays exactly
as it is and starts talking to PHP endpoints.

### 1. Create the database

hPanel → **Databases** → **MySQL Databases**. Create a database and user, and note the name,
username and password — Hostinger prefixes them, e.g. `u123456789_adelaide`.

### 2. Create the tables

hPanel → **phpMyAdmin** → **SQL** tab, then run:

```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL UNIQUE,
  description TEXT,
  image VARCHAR(255),
  featured TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  sku VARCHAR(60),
  category VARCHAR(140),
  short_description VARCHAR(400),
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  compare_price DECIMAL(10,2) NULL,
  stock INT NOT NULL DEFAULT 0,
  image VARCHAR(255),
  gallery TEXT,
  colors VARCHAR(255),
  materials VARCHAR(255),
  dimensions VARCHAR(255),
  weight VARCHAR(60),
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  featured TINYINT(1) DEFAULT 0,
  is_new TINYINT(1) DEFAULT 0,
  bestseller TINYINT(1) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(40), address VARCHAR(255), city VARCHAR(120),
  state VARCHAR(120), postcode VARCHAR(20), country VARCHAR(120) DEFAULT 'Australia',
  role VARCHAR(20) DEFAULT 'customer',
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(40) NOT NULL UNIQUE,
  user_id INT NULL,
  customer_name VARCHAR(160), customer_email VARCHAR(190), customer_phone VARCHAR(40),
  address VARCHAR(255), city VARCHAR(120), state VARCHAR(120),
  postcode VARCHAR(20), country VARCHAR(120), notes TEXT,
  subtotal DECIMAL(10,2), discount DECIMAL(10,2), shipping DECIMAL(10,2),
  tax DECIMAL(10,2), total DECIMAL(10,2),
  coupon_code VARCHAR(60), payment_method VARCHAR(60),
  payment_status VARCHAR(20) DEFAULT 'pending',
  status VARCHAR(20) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL,
  name VARCHAR(200), image VARCHAR(255),
  price DECIMAL(10,2), quantity INT, variant VARCHAR(120),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL, user_id INT NULL,
  author VARCHAR(140), email VARCHAR(190),
  rating TINYINT DEFAULT 5, title VARCHAR(180), body TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(60) NOT NULL UNIQUE,
  type VARCHAR(20) DEFAULT 'percent',
  value DECIMAL(10,2) DEFAULT 0,
  min_spend DECIMAL(10,2) DEFAULT 0,
  usage_limit INT DEFAULT 0, used_count INT DEFAULT 0,
  expires_at DATE NULL, active TINYINT(1) DEFAULT 1,
  description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(220), slug VARCHAR(240) UNIQUE,
  excerpt VARCHAR(500), body LONGTEXT, cover VARCHAR(255),
  author VARCHAR(140), tags VARCHAR(255), read_time INT DEFAULT 5,
  status VARCHAR(20) DEFAULT 'published', published_at DATE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(140), email VARCHAR(190), phone VARCHAR(40),
  subject VARCHAR(200), body TEXT, is_read TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

The JSON in `src/data/` maps 1:1 onto these tables. Import it once with a small PHP script
or convert to CSV and use phpMyAdmin's import tab.

### 3. Add the API

Create `public_html/api/` with a shared connection file:

```php
<?php // api/db.php
$DB = new PDO(
  'mysql:host=localhost;dbname=u123456789_adelaide;charset=utf8mb4',
  'u123456789_user',
  'your-password',
  [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
   PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
);
header('Content-Type: application/json');
session_start();

function body() { return json_decode(file_get_contents('php://input'), true) ?: []; }
function requireAdmin() {
  if (empty($_SESSION['admin'])) { http_response_code(401); echo json_encode(['error'=>'Unauthorised']); exit; }
}
```

Then one file per resource — `products.php`, `orders.php`, `auth.php`, and so on:

```php
<?php // api/products.php
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $rows = $DB->query("SELECT * FROM products WHERE status='published'")->fetchAll();
  foreach ($rows as &$r) {
    $r['colors']  = explode(',', $r['colors'] ?? '');
    $r['gallery'] = json_decode($r['gallery'] ?? '[]');
  }
  echo json_encode($rows);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  requireAdmin();
  $d = body();
  $stmt = $DB->prepare(
    "INSERT INTO products (name, slug, sku, category, price, stock, image, status)
     VALUES (?,?,?,?,?,?,?,?)"
  );
  $stmt->execute([$d['name'], $d['slug'], $d['sku'], $d['category'],
                  $d['price'], $d['stock'], $d['image'], $d['status']]);
  echo json_encode(['id' => $DB->lastInsertId()]);
  exit;
}
```

**Passwords must be hashed** — never store them in plain text:

```php
// registering
$hash = password_hash($plainPassword, PASSWORD_DEFAULT);
// signing in
if (password_verify($submitted, $row['password_hash'])) { $_SESSION['user'] = $row['id']; }
```

### 4. Rewrite `data.js`

This is the only frontend file that changes. Replace the bodies; keep the signatures.

```js
const API = '/api';

async function req(path, options = {}) {
  const res = await fetch(`${API}/${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAllProducts() {
  return req('products.php');
}

export async function getProduct(slug) {
  return req(`products.php?slug=${encodeURIComponent(slug)}`);
}

export async function saveProduct(input) {
  return req('products.php', { method: 'POST', body: JSON.stringify(input) });
}

export async function createOrder(payload) {
  return req('orders.php', { method: 'POST', body: JSON.stringify(payload) });
}

export async function loginCustomer(email, password) {
  return req('auth.php', { method: 'POST', body: JSON.stringify({ email, password }) });
}
// …and so on for the rest of the exports
```

Keep the filtering, sorting and pagination logic in `getProducts()` as it is at first — it
works fine on a few hundred products. Push it into SQL once the catalogue grows.

### 5. Handle the pages that were pre-rendered

Product, category and blog pages are generated at build time from JSON. Once the database is
live, either:

- **Rebuild and re-upload** whenever you add a product (fine at low volume), or
- Add a client-side fetch on those pages so new products appear without a rebuild, or
- Move to Route B, where the server renders every request and this stops being a question.

---

## Route B — Next.js + MySQL on a VPS

The cleanest option. One language, real server rendering, no separate API to maintain.

1. Delete `output: 'export'` from `next.config.mjs`
2. `npm install mysql2 bcryptjs jose`
3. Create `src/lib/db.js` with a `mysql2/promise` pool
4. Move each `data.js` function into `src/app/api/*/route.js` handlers
5. Rewrite `data.js` to `fetch` those routes (or, for server components, call the database
   directly — a nice bonus you cannot have on static)
6. Replace `AuthContext` with real sessions: `bcryptjs` for hashing, `jose` for signed
   cookies, a `middleware.js` that guards `/admin`
7. Deploy: `npm run build`, then `pm2 start npm --name adelaide -- start`, with Nginx
   proxying port 3000

Hostinger VPS plans start around $5–8/month and include full SSH access.

---

## Route C — Supabase, keeping the static frontend

Fastest path to real data with no server to manage.

1. Create a free project at supabase.com
2. Create the tables above through the table editor
3. `npm install @supabase/supabase-js`
4. Rewrite `data.js` against the Supabase client:

```js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function getAllProducts() {
  const { data, error } = await supabase.from('products').select('*').eq('status', 'published');
  if (error) throw error;
  return data;
}
```

5. Use Supabase Auth for accounts — it replaces `AuthContext` almost directly
6. **Turn on Row Level Security** on every table, or your anon key lets anyone write

The site still deploys to Hostinger as static files. Supabase handles the data.

---

## Whichever route you take

- [ ] Hash passwords — never store plain text
- [ ] Validate and sanitise every input on the **server**; client validation is a convenience, not a defence
- [ ] Use prepared statements everywhere (the PHP above does)
- [ ] Put the admin behind real server-side sessions, not a client-side check
- [ ] Add a payment provider (Stripe, Square) rather than collecting card numbers yourself —
      the checkout card form is a demo mock and must not be used to take real payments
- [ ] Set up transactional email for order confirmations
- [ ] Back up the database on a schedule

---

## A rough map of the work

| Task | Time |
|---|---|
| Database + tables + importing the seed data | 2–3 hrs |
| API endpoints (products, orders, auth, the rest) | 3–4 hrs |
| Rewriting `data.js` | 1–2 hrs |
| Real authentication and sessions | 2–3 hrs |
| Image upload from the admin panel | 1–2 hrs |
| Testing | 2 hrs |

Call it one focused day, two at a comfortable pace.

---

## Route D — Vercel + Neon + Vercel Blob (implemented on `feat/neon-backend`)

This branch already contains the full migration. It swaps the static export for a Next.js
server app: pages render on demand and read live data from Neon Postgres through the API
routes in `src/app/api/*`. Passwords are bcrypt-hashed, sessions are signed cookies (jose),
`/admin` is guarded by `middleware.js`, and admin image uploads go to Vercel Blob.

### What changed

| Area | Files |
|---|---|
| Config | `next.config.mjs` (no more `output: 'export'`), `.env.example` |
| Database | `src/lib/db.js` (Neon client + generic `{ id, data }` collections), `scripts/schema.sql`, `scripts/seed.mjs` |
| Server logic | `src/lib/queries.js` (all business logic, DB-backed), `src/app/api/**` (route handlers) |
| Auth | `src/lib/auth.js`, `src/middleware.js`, `/api/auth/*`, `/api/account` |
| Data layer | `src/lib/data.js` — now thin `fetch` wrappers; **every signature unchanged** |
| Uploads | `/api/upload` + an Upload button in the product form |

The storefront, admin screens, cart/wishlist, and design system are untouched.

### Run it locally

1. Create a database at [neon.tech] (or via Vercel's Neon integration) and copy the **pooled**
   connection string.
2. `cp .env.example .env.local` and fill in `DATABASE_URL`, a long random `SESSION_SECRET`,
   and (optionally) `BLOB_READ_WRITE_TOKEN`.
3. `npm install`
4. `npm run seed`  — creates the tables and loads `src/data/*.json` (hashing passwords).
5. `npm run dev`

Admin login uses the credentials from `src/data/settings.json`
(`admin@adelaidefurniture.com.au` / `adelaide2026`) — **change these before going live.**
Seeded customer accounts all use the password `demo1234`.

### Deploy to Vercel

1. Import the repo; framework auto-detects as **Next.js** (no static-export settings).
2. Add a Neon integration (or set `DATABASE_URL`) and create a **Blob store** (adds
   `BLOB_READ_WRITE_TOKEN`). Set `SESSION_SECRET` and `NEXT_PUBLIC_SITE_URL`.
3. Deploy, then run the seed once against the production database
   (`DATABASE_URL=... npm run seed` locally, or from a one-off job).

### Notes & next steps

- **Data model:** each collection is one table of `(id, data jsonb)` — fast to migrate, keeps
  the JSON shapes identical. Split hot fields into real columns if a table grows large.
- **Order lookup** (`GET /api/orders/[id]`) is public so the confirmation page works for guest
  checkout; tighten to an owner check if you require it.
- **Payments** are still a mock — wire Stripe/Square before taking real money.
- `id`s are assigned with `MAX(id)+1`; fine at this scale, switch to an identity/sequence if
  you expect concurrent writes.
