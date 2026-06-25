CREATE TABLE IF NOT EXISTS b44_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Women',
  image_url TEXT NOT NULL DEFAULT '',
  price DOUBLE PRECISION,
  rating DOUBLE PRECISION,
  reviews_count INTEGER,
  best_seller_rank INTEGER,
  affiliate_url TEXT NOT NULL DEFAULT '',
  affiliate_site TEXT NOT NULL DEFAULT 'Amazon',
  description TEXT NOT NULL DEFAULT '',
  material TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE b44_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select" ON b44_products FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON b44_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON b44_products FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON b44_products FOR DELETE USING (true);
