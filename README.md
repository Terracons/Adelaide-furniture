# Adelaide Furniture

A complete furniture ecommerce storefront and admin panel, built with **Next.js 14** and
**Tailwind CSS**, in a gold-and-charcoal palette.

It compiles to a **static site** — plain HTML, CSS and JavaScript — so it runs on ordinary
shared hosting (Hostinger, cPanel, Netlify, GitHub Pages, anything that serves files). No
Node process, no database server, no VPS.

---

## Quick start

```bash
npm install          # once
npm run dev          # http://localhost:3000
```

Build the uploadable site:

```bash
npm run build        # writes everything to ./out
```

Preview the built site exactly as the host will serve it:

```bash
npm run serve        # http://localhost:3000 from ./out
```

---

## Sign-in details

| Area | URL | Credentials |
|---|---|---|
| Admin panel | `/admin` | `admin@adelaidefurniture.com.au` / `adelaide2026` |
| Demo customer | `/account/login` | `priya.nandan@example.com` / `demo1234` |

Change the admin credentials in **Admin → Settings**, or edit `src/data/settings.json`.

> **On security:** this is a static site, so there is no server to check a password against.
> The admin gate keeps casual visitors out of the UI; it is not real authentication. For a
> public store, either put `/admin` behind Hostinger's *Password Protect Directories*, or
> follow `MIGRATE-TO-SERVER.md` to add a real backend.

---

## What's included

**Storefront**

- Home with rotating hero, category grid, featured/new/bestseller tabs, countdown promo,
  craft story, testimonial carousel, journal teaser and Instagram strip
- Shop with live filtering (category, price, finish, stock, new), sorting, grid/list views,
  search and pagination
- Category landing pages for all 8 collections
- Product detail: image gallery with zoom, finish picker, quantity, stock status,
  spec accordion, reviews with a working write-a-review form, related products, JSON-LD
- Cart page + slide-out cart drawer with a free-delivery progress bar
- Three-step checkout with validation, coupon codes and four payment methods
- Order confirmation with a printable receipt
- Wishlist, About, Contact (with form + map), FAQ with JSON-LD
- Journal index and article pages
- Customer accounts: register, sign in, editable profile, order history with a delivery timeline
- Custom 404, sitemap.xml, robots.txt

**Admin panel** (`/admin`)

- Dashboard: revenue, orders, customers, stock alerts, revenue-by-month area chart,
  order-status donut, category bar chart, best sellers, recent orders
- Products: full CRUD, duplicate, draft/publish, stock, gallery, featured flags
- Orders: filter by status, inline status changes, full order drawer, payment status
- Customers: lifetime value, order counts, block/reactivate
- Categories, Reviews (approve/reject queue), Blog, Coupons, Messages + newsletter list
- Settings: store details, delivery rules, announcement bar, social links, admin credentials
- "Reset demo data" to restore everything to the shipped state

---

## Project structure

```
src/
├── app/                  Every route (Next.js App Router)
│   ├── admin/            The admin panel
│   ├── product/[slug]/   Generated for all 28 products at build time
│   ├── category/[slug]/  Generated for all 8 categories
│   └── blog/[slug]/      Generated for all articles
├── components/
│   ├── layout/           Header, Footer, cart drawer, search overlay
│   ├── home/             Home page sections
│   ├── shop/             Filters + shop grid
│   ├── product/          Cards, gallery, reviews, quick view
│   ├── admin/            Admin shell, data table, stat cards
│   └── ui/               Buttons, badges, modal, pagination, ratings
├── context/              Cart, wishlist, auth, toast providers
├── data/                 Seed JSON — products, categories, orders, posts, coupons…
└── lib/
    ├── data.js           ★ THE DATA LAYER — the only file that knows where data lives
    ├── store.js          localStorage persistence
    ├── format.js         Currency, dates, slugs
    └── hooks.js          useData, useDebounced, useScrollLock…
```

### How data works

`src/data/*.json` ships with the site and is baked into the build — that is what search
engines and first-time visitors see. Anything you change in the admin panel is saved to
**localStorage** in that browser and layered on top.

This means admin edits are per-browser and do not sync between devices. That is the
trade-off of running with no server. When you want real persistence, `MIGRATE-TO-SERVER.md`
walks through it — you rewrite one file.

---

## Changing the look

| What | Where |
|---|---|
| Colours (gold, ink, cream) | `tailwind.config.js` → `theme.extend.colors` |
| Fonts | `src/app/globals.css` (top `@import`) and `tailwind.config.js` |
| Buttons, inputs, cards | `src/app/globals.css` → `@layer components` |
| Logo | The `AF` mark in `Header.jsx` and `Footer.jsx` |
| Announcement bar | Admin → Settings, or `src/data/settings.json` |

## Using real photographs

The site ships with generated SVG artwork so it works offline and weighs about 500 KB total.
To use real product photos:

1. Drop your images into `public/images/products/`
2. Either edit `src/data/products.json` (`image` and `gallery` fields), or open
   Admin → Products → Edit and paste the path, e.g. `/images/products/my-sofa.jpg`
3. Re-run `npm run build`

Full-size external URLs work too — paste any `https://…` image address.

---

## Deployment

See **`DEPLOY-HOSTINGER.md`** for step-by-step upload instructions.

## Growing out of static

See **`MIGRATE-TO-SERVER.md`** when you want real accounts, synced admin edits, payments or
email. It is roughly a day of work and touches one file.
