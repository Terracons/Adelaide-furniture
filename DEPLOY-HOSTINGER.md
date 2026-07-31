# Deploying to Hostinger shared hosting

No VPS. No Node.js on the server. No database. You build the site on your own computer and
upload the resulting folder.

---

## Step 1 — Build the site (on your computer)

Install Node.js 18 or newer from [nodejs.org](https://nodejs.org), then in the project folder:

```bash
npm install
npm run build
```

When it finishes you will have a new **`out/`** folder. That folder *is* your website —
every page has been turned into a real HTML file.

Before you build, set your domain so links and the sitemap are correct. Create a file called
`.env.local` next to `package.json`:

```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

Then run `npm run build` again.

---

## Step 2 — Check it locally first

```bash
npm run serve
```

Open http://localhost:3000. This serves the `out/` folder exactly as Hostinger will. If it
works here, it will work there.

---

## Step 3 — Upload

### Option A — hPanel File Manager (easiest)

1. Log in to Hostinger → **Websites** → **Manage** → **File Manager**
2. Open the **`public_html`** folder
3. Delete anything already in there (usually a `default.php` placeholder)
4. On your computer, select **everything inside** `out/` — the files, not the `out` folder
   itself — and compress it into a `.zip`
5. Upload the zip into `public_html`, then right-click it → **Extract**
6. Delete the zip when extraction finishes

> **Important:** upload the *contents* of `out/`, not the folder. `index.html` must sit
> directly inside `public_html`, not inside `public_html/out/`.

### Option B — FTP (better for large uploads)

1. hPanel → **Files** → **FTP Accounts** — note the host, username and password
2. Connect with [FileZilla](https://filezilla-project.org)
3. Drag everything inside `out/` into `public_html`

### Step 3b — the `.htaccess` file

The build already places `.htaccess` in `out/`, but File Manager hides dotfiles by default.
In File Manager click **Settings** → tick **Show hidden files** and confirm `.htaccess` is in
`public_html`. If it is missing, copy it from `public/.htaccess` in the project.

It handles HTTPS redirects, clean URLs, gzip compression, caching and the 404 page.

---

## Step 4 — Turn on HTTPS

hPanel → **Security** → **SSL** → install the free Let's Encrypt certificate, then enable
**Force HTTPS**. Give it up to an hour to go live.

---

## Step 5 — Protect the admin panel

Anyone can reach `/admin` and the demo password sits in the JavaScript bundle. Add a real
lock on top:

hPanel → **Files** → **Password Protect Directories** → choose `public_html/admin` → set a
username and password.

Browsers will now demand that password before the admin page will even load.

---

## Updating the site later

Any change — a new product, a price, a blog post — follows the same loop:

```bash
npm run build
```

…then re-upload the contents of `out/`. Overwriting the existing files is fine.

> **Careful:** products you add through the admin panel live in *your browser only*. They
> will not appear for other visitors and they vanish if you clear your browser data. To
> publish a product for everyone, add it to `src/data/products.json` and rebuild. If that
> becomes annoying, that is the signal to read `MIGRATE-TO-SERVER.md`.

---

## Deploying into a subfolder

To serve the store from `yourdomain.com/store` instead of the root, uncomment these two
lines in `next.config.mjs` before building:

```js
basePath: '/store',
assetPrefix: '/store/',
```

Then upload `out/` into `public_html/store/`.

---

## Troubleshooting

**Everything is unstyled / plain text**
The CSS files did not upload, or you uploaded the `out` folder instead of its contents.
Confirm a `_next` folder sits directly inside `public_html`.

**Links work but refreshing a page gives 404**
`.htaccess` is missing or hidden. See Step 3b.

**Images are missing**
Confirm `public_html/images/` exists and contains `products`, `categories`, `hero`, `blog`.

**Changes are not showing**
Browser cache. Hard-refresh with `Ctrl+F5` (`Cmd+Shift+R` on Mac). The `.htaccess` tells
browsers to cache assets for a year, which is what you want in production but confusing
while testing.

**`npm run build` fails**
Check you are on Node 18+ with `node -v`. If it still fails, delete `node_modules` and
`package-lock.json`, then run `npm install` again.

---

## Other hosts

The `out/` folder works anywhere that serves static files:

| Host | How |
|---|---|
| **Netlify** | Drag the `out` folder onto app.netlify.com/drop |
| **Vercel** | `npx vercel --prod` |
| **Cloudflare Pages** | Connect the repo, build `npm run build`, output `out` |
| **GitHub Pages** | Push `out/` to a `gh-pages` branch |
| **Any cPanel host** | Same as Hostinger — upload to `public_html` |
