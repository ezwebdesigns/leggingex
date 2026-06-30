-- ============================================
-- Migration: Base44 → Supabase (Tables CMS)
-- Exécute dans l'éditeur SQL du dashboard Supabase
-- ============================================

-- 1. hero_banners
CREATE TABLE hero_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. home_sections
CREATE TABLE home_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  section_type TEXT DEFAULT 'products',
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  product_limit INTEGER DEFAULT 8,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. category_tags
CREATE TABLE category_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. home_categories
CREATE TABLE home_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  image_url TEXT,
  faq_schema JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. catalogue_pages
CREATE TABLE catalogue_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link TEXT,
  faq_schema JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. cta_cards
CREATE TABLE cta_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT,
  link TEXT NOT NULL,
  bg_color TEXT,
  text_color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. editorial_cards
CREATE TABLE editorial_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  button_text TEXT,
  button_link TEXT,
  secondary_text TEXT,
  secondary_link TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. ad_banners
CREATE TABLE ad_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT DEFAULT 'image',
  title TEXT,
  subtitle TEXT,
  image_url TEXT,
  link TEXT,
  button_text TEXT,
  bg_color TEXT DEFAULT '#000000',
  script_content TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. pages (blog posts + static pages)
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'static_page',
  excerpt TEXT,
  cover_image TEXT,
  published BOOLEAN DEFAULT false,
  published_at DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogue_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies (public read, admin write)
-- ============================================

-- hero_banners: public can read active, only admins can write
CREATE POLICY "Public can read active hero_banners"
  ON hero_banners FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert hero_banners"
  ON hero_banners FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update hero_banners"
  ON hero_banners FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can delete hero_banners"
  ON hero_banners FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- home_sections: public can read active
CREATE POLICY "Public can read active home_sections"
  ON home_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert home_sections"
  ON home_sections FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update home_sections"
  ON home_sections FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can delete home_sections"
  ON home_sections FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- category_tags: public can read active
CREATE POLICY "Public can read active category_tags"
  ON category_tags FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert category_tags"
  ON category_tags FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update category_tags"
  ON category_tags FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can delete category_tags"
  ON category_tags FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- home_categories: public can read active
CREATE POLICY "Public can read active home_categories"
  ON home_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert home_categories"
  ON home_categories FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update home_categories"
  ON home_categories FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can delete home_categories"
  ON home_categories FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- catalogue_pages: public can read active
CREATE POLICY "Public can read active catalogue_pages"
  ON catalogue_pages FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert catalogue_pages"
  ON catalogue_pages FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update catalogue_pages"
  ON catalogue_pages FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can delete catalogue_pages"
  ON catalogue_pages FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- cta_cards: public can read active
CREATE POLICY "Public can read active cta_cards"
  ON cta_cards FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert cta_cards"
  ON cta_cards FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update cta_cards"
  ON cta_cards FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can delete cta_cards"
  ON cta_cards FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- editorial_cards: public can read active
CREATE POLICY "Public can read active editorial_cards"
  ON editorial_cards FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert editorial_cards"
  ON editorial_cards FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update editorial_cards"
  ON editorial_cards FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can delete editorial_cards"
  ON editorial_cards FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- ad_banners: public can read active
CREATE POLICY "Public can read active ad_banners"
  ON ad_banners FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert ad_banners"
  ON ad_banners FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update ad_banners"
  ON ad_banners FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can delete ad_banners"
  ON ad_banners FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- pages: public can read published
CREATE POLICY "Public can read published pages"
  ON pages FOR SELECT USING (published = true);
CREATE POLICY "Admins can insert pages"
  ON pages FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update pages"
  ON pages FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can delete pages"
  ON pages FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');
