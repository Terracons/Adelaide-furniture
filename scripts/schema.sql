-- Adelaide Furniture — Neon Postgres schema.
-- Document-in-Postgres model: each collection is (id, data jsonb).
-- Applied automatically by scripts/seed.mjs, or run manually in the Neon SQL editor.

CREATE TABLE IF NOT EXISTS products    (id INTEGER PRIMARY KEY, data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS categories  (id INTEGER PRIMARY KEY, data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS orders      (id INTEGER PRIMARY KEY, data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS customers   (id INTEGER PRIMARY KEY, data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS reviews     (id INTEGER PRIMARY KEY, data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS posts       (id INTEGER PRIMARY KEY, data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS coupons     (id INTEGER PRIMARY KEY, data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS messages    (id INTEGER PRIMARY KEY, data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS subscribers (id INTEGER PRIMARY KEY, data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS settings    (id INTEGER PRIMARY KEY, data JSONB NOT NULL);

-- Helpful indexes for the most common lookups.
CREATE INDEX IF NOT EXISTS products_slug_idx   ON products   ((data->>'slug'));
CREATE INDEX IF NOT EXISTS products_status_idx ON products   ((data->>'status'));
CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories ((data->>'slug'));
CREATE INDEX IF NOT EXISTS posts_slug_idx      ON posts      ((data->>'slug'));
CREATE INDEX IF NOT EXISTS orders_user_idx     ON orders     ((data->>'userId'));
CREATE INDEX IF NOT EXISTS reviews_product_idx ON reviews    ((data->>'productId'));
CREATE UNIQUE INDEX IF NOT EXISTS customers_email_idx ON customers (LOWER(data->>'email'));
