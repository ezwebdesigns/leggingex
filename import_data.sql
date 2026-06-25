
-- ============================================
-- Import Base44 to Supabase
-- ============================================
INSERT INTO hero_banners (title, subtitle, image_url, link, sort_order, is_active) VALUES
('Bestsellers', 'Top-rated leggings', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80', '/catalogue?sort=rating', 1, true),
('High Waisted', 'High waist & premium comfort', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80', '/catalogue?category=High+Waisted+Leggings', 2, true),
('Sport & Yoga', 'Performance & freedom of movement', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80', '/catalogue?category=Yoga+Pants', 3, true);

INSERT INTO home_sections (title, section_type, category, sort_order, product_limit, is_active) VALUES
('New & Now', 'editorial', NULL, 6, 8, true),
('Sponsored', 'ad_banner', NULL, 7, 2, true),
('Recent Articles', 'articles', NULL, 8, 8, true),
('Specials & Offers', 'cta_cards', NULL, 4, 2, true),
('Top Rated', 'products', NULL, 1, 12, true),
('High Waisted', 'products', 'High Waisted Leggings', 2, 8, true),
('Biker Shorts', 'products', 'Biker Shorts', 3, 8, true),
('New Arrivals', 'products', NULL, 5, 12, true);

INSERT INTO category_tags (label, value, sort_order, is_active) VALUES
('Biker Shorts', 'Biker Shorts', 1, true),
('Cycling Shorts', 'Cycling Shorts', 2, false),
('Yoga Pants', 'Yoga Pants', 3, true),
('High Waisted', 'High Waisted Leggings', 4, true),
('High Waisted Shorts', 'High Waisted Shorts', 5, true),
('Gym Shorts', 'Gym Shorts', 6, true),
('Gym Leggings', 'Gym Leggings', 7, true),
('Booty Shorts', 'Booty Shorts', 8, true),
('Booty Leggings', 'Booty Leggings', 9, false),
('Plus Size Leggings', 'Plus Size Leggings', 10, true),
('Plus Size Shorts', 'Plus Size Shorts', 11, false),
('Workout Shorts', 'Workout Shorts', 12, true),
('Workout Leggings', 'Workout Leggings', 13, true),
('Cropped', 'Cropped Leggings', 14, false),
('Leather', 'Leather Leggings', 15, true),
('Fashion', 'Fashion Leggings', 16, false),
('Pack', 'Pack', 17, true),
('Waist Trainer', 'Waist Trainer', 18, false),
('Shapewear', 'Shapewear', 19, true);

INSERT INTO home_categories (label, value, image_url, sort_order, is_active) VALUES
('Biker Shorts', 'Biker Shorts', NULL, 1, true),
('Yoga Pants', 'Yoga Pants', NULL, 2, true),
('High Waisted', 'High Waisted Leggings', NULL, 3, true),
('Gym Shorts', 'Gym Shorts', NULL, 4, true),
('Plus Size', 'Plus Size Leggings', NULL, 5, true),
('Workout', 'Workout Leggings', NULL, 6, true),
('Fashion', 'Fashion Leggings', NULL, 7, true),
('Leather', 'Leather Leggings', NULL, 8, true);

INSERT INTO cta_cards (title, image_url, link, bg_color, text_color, sort_order, is_active) VALUES
('SHAPELLX INTERNATIONAL SHAPEWEAR DAY UP TO 60% OFF', 'https://a.impactradius-go.com/display-ad/17949-1773693', 'https://shapellxaffiliateprogram.pxf.io/c/3676759/1773693/17949', NULL, NULL, 0, true),
('Your first shaper dress', 'https://a.impactradius-go.com/display-ad/17949-1577874', 'https://shapellxaffiliateprogram.pxf.io/c/3676759/1577874/17949', NULL, NULL, 0, false),
('Pppilush Perfect holiday gift idea for women', 'https://a.impactradius-go.com/display-ad/16873-1520234', 'https://popilush.pxf.io/c/3676759/1520234/16873', NULL, NULL, 0, true),
('SAVE 30%! PowerConceal™ Ultra Comfy Body Shaper', 'https://a.impactradius-go.com/display-ad/17949-1574729', 'https://shapellxaffiliateprogram.pxf.io/c/3676759/1574729/17949', NULL, NULL, 0, true),
('SAVE 25%! AirSlim® Firm Tummy Compression Bodysuit Shaper With Butt Lifter', 'https://a.impactradius-go.com/display-ad/17949-1574726', 'https://shapellxaffiliateprogram.pxf.io/c/3676759/1574726/17949', NULL, NULL, 0, true),
('SAVE 15%! PowerConceal™ Full Body Tummy Control Shapewear', 'https://a.impactradius-go.com/display-ad/17949-1574727', 'https://shapellxaffiliateprogram.pxf.io/c/3676759/1574727/17949', NULL, NULL, 0, true),
('Shapellx Fit Everybody Smooth Ruched Shaping Dress', 'https://a.impactradius-go.com/display-ad/17949-1577873', 'https://shapellxaffiliateprogram.pxf.io/c/3676759/1577873/17949', NULL, NULL, 0, true);

-- editorial_cards: no data

INSERT INTO ad_banners (type, title, subtitle, image_url, link, button_text, bg_color, script_content, sort_order, is_active) VALUES
('script', 'Styles for you. Shop Now', NULL, NULL, NULL, NULL, '#000000', $$
<!DOCTYPE html> <html> <head>     <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline';"> </head> <body>             <a rel="sponsored"            href="https://popilush.pxf.io/c/3676759/1574157/16873" target="_top" id="1574157"> <img src="//a.impactradius-go.com/display-ad/16873-1574157" border="0" alt="" width="1200" height="1680"/></a><img height="0" width="0" src="https://imp.pxf.io/i/3676759/1574157/16873" style="position:absolute;visibility:hidden;" border="0" /> </body> </html>
$$, 0, false),
('script', 'SAVE 30%! PowerConceal™ Ultra Comfy Body Shaper
', 'Get perfect body-hugging shape and breathability with the PowerConceal™ Ultra Comfy Body Shaper.﻿ Its whisper-soft and seamless construction make this sculpting piece essential for enhancing your body''s natural shape.', NULL, NULL, NULL, '#000000', $$
<!DOCTYPE html> <html> <head>     <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline';"> </head> <body>             <a rel="sponsored"            href="https://shapellxaffiliateprogram.pxf.io/c/3676759/1574729/17949" target="_top" id="1574729"> <img src="//a.impactradius-go.com/display-ad/17949-1574729" border="0" alt="" width="1000" height="1500"/></a><img height="0" width="0" src="https://imp.pxf.io/i/3676759/1574729/17949" style="position:absolute;visibility:hidden;" border="0" /> </body> </html>
$$, 0, false),
('script', 'SHAPELLX NEW ARRIVAL', 'Built-In 360° Smooth Ruched Shaping Dress', NULL, NULL, NULL, '#000000', $$
<!DOCTYPE html> <html> <head>     <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline';"> </head> <body>             <a rel="sponsored"            href="https://shapellxaffiliateprogram.pxf.io/c/3676759/1642982/17949" target="_top" id="1642982"> <img src="//a.impactradius-go.com/display-ad/17949-1642982" border="0" alt="" width="160" height="600"/></a><img height="0" width="0" src="https://imp.pxf.io/i/3676759/1642982/17949" style="position:absolute;visibility:hidden;" border="0" /> </body> </html>
$$, 0, false),
('script', 'SAVE 25%! AirSlim® Firm Tummy Compression Bodysuit Shaper With Butt Lifter', 'Want to feel & look your best in seconds? The AirSlim® Firm Tummy Compression Bodysuit Shaper Butt Lifter is made with firm compression fabric to comfortably, but effectively, sculpt your body from your back, waist down to your tummy and thighs. And they stay in place, no matter how much you dance, run, or shake throughout the day!', NULL, NULL, NULL, '#000000', $$
<!DOCTYPE html> <html> <head>     <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline';"> </head> <body>             <a rel="sponsored"            href="https://shapellxaffiliateprogram.pxf.io/c/3676759/1574726/17949" target="_top" id="1574726"> <img src="//a.impactradius-go.com/display-ad/17949-1574726" border="0" alt="" width="1000" height="1500"/></a><img height="0" width="0" src="https://imp.pxf.io/i/3676759/1574726/17949" style="position:absolute;visibility:hidden;" border="0" /> </body> </html>
$$, 0, false),
('script', 'SAVE 15%! PowerConceal™ Full Body Tummy Control Shapewear', 'With a mid-thigh length, this tummy control shapewear holds in your core, shapes and lifts your butt and chest, and smooths your upper thighs. Made of breathable mesh material, easy and comfortable for all-day long-wearing, perfectly contour to your unique curves while also allowing ideal airflow.', NULL, NULL, NULL, '#000000', $$
<!DOCTYPE html> <html> <head>     <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline';"> </head> <body>             <a rel="sponsored"            href="https://shapellxaffiliateprogram.pxf.io/c/3676759/1574727/17949" target="_top" id="1574727"> <img src="//a.impactradius-go.com/display-ad/17949-1574727" border="0" alt="" width="1000" height="1500"/></a><img height="0" width="0" src="https://imp.pxf.io/i/3676759/1574727/17949" style="position:absolute;visibility:hidden;" border="0" /> </body> </html>
$$, 0, false),
('script', 'Shapellx Banner', 'EVERYDAY SHAPEWEAR, EVERYDAY SHAPELLX', NULL, NULL, NULL, '#000000', $$
<!DOCTYPE html> <html> <head>     <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline';"> </head> <body>             <a rel="sponsored"            href="https://shapellxaffiliateprogram.pxf.io/c/3676759/1574770/17949" target="_top" id="1574770"> <img src="//a.impactradius-go.com/display-ad/17949-1574770" border="0" alt="" width="5184" height="2592"/></a><img height="0" width="0" src="https://imp.pxf.io/i/3676759/1574770/17949" style="position:absolute;visibility:hidden;" border="0" /> </body> </html>
$$, 0, true),
('script', 'Shapellx new arrival', 'Shapellx Fit Everybody Smooth Ruched Shaping Dress', NULL, NULL, NULL, '#000000', $$
<!DOCTYPE html> <html> <head>     <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline';"> </head> <body>             <a rel="sponsored"            href="https://shapellxaffiliateprogram.pxf.io/c/3676759/1577873/17949" target="_top" id="1577873"> <img src="//a.impactradius-go.com/display-ad/17949-1577873" border="0" alt="" width="940" height="788"/></a><img height="0" width="0" src="https://imp.pxf.io/i/3676759/1577873/17949" style="position:absolute;visibility:hidden;" border="0" /> </body> </html>
$$, 0, false);

INSERT INTO pages (slug, title, content, type, excerpt, cover_image, published, published_at) VALUES
('test1', 'Article 1: Lorem ipsum dolor sit amet', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'blog_post', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80', true, '2026-06-23'::DATE),
('about', 'About', '# About Leggings

Leggings is a discovery and comparison platform for leggings. We curate the best products on the market and redirect you to our affiliate partners to complete your purchases.

Our mission: help you find the perfect pair of leggings, whatever your style, body type, or budget.', 'static_page', NULL, NULL, true, '2026-06-21'::DATE),
('contact', 'Contact', '# Contact Us

Have a question? A suggestion? We''re here to help.

- **Email:** contact@leggings.com
- **Response time:** 24-48 hours

Feel free to reach out — our team will get back to you as soon as possible.', 'static_page', NULL, NULL, true, '2026-06-21'::DATE),
('terms', 'Terms of Use', '# Terms of Use

By using this site, you agree to the following terms.

## Affiliate Links

This site contains affiliate links. When you click a link and make a purchase, we may earn a commission. This does not affect the price you pay.

## Use of Site

Content on this site is provided for informational purposes only. We do not guarantee the accuracy of product information, pricing, or availability.', 'static_page', NULL, NULL, true, '2026-06-21'::DATE),
('privacy', 'Privacy Policy', '# Privacy Policy

Your privacy is important to us.

## Data Collected

We only collect data necessary for the site to function (country preferences, locally stored favorites).

## Cookies

This site uses local storage features to remember your preferences. No personal data is sold to third parties.', 'static_page', NULL, NULL, true, '2026-06-21'::DATE),
('disclaimer', 'Disclaimer', '# Disclaimer

This site contains affiliate links to partner sites (including Amazon).

## Affiliation

As an affiliate partner, we earn a commission on qualifying purchases made through our links. Product prices and availability are indicative and may vary on the partner''s site.

## Recommendations

Our recommendations are based on product ratings and reviews. We are not responsible for the quality or compliance of products sold by our partners.', 'static_page', NULL, NULL, true, '2026-06-21'::DATE);

INSERT INTO b44_products (name, brand, category, image_url, price, rating, reviews_count, best_seller_rank, affiliate_url, affiliate_site, description, material, status, is_featured) VALUES
('Legging sport taille haute femme – Compression Pro', 'Gymshark', 'Femmes', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80', 44.99, 4.7, 3842, 1, 'https://amazon.fr', 'Amazon', 'Legging compression ultra-doux, maintien parfait pour le yoga, le fitness et la course à pied. Taille haute gainante.', '88% Polyester, 12% Elasthanne', 'active', true),
('Legging Yoga Buttery Soft – 7/8', 'Lululemon', 'Femmes', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80', 98, 4.9, 12450, 2, 'https://amazon.fr', 'Amazon', 'Le legging emblématique Align de Lululemon, tissu Nulu ultra-léger, pour le yoga et le quotidien.', '81% Nylon, 19% Lycra', 'active', true),
('Legging Running Nike Dri-FIT', 'Nike', 'Femmes', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80', 54.95, 4.5, 2109, 5, 'https://amazon.fr', 'Amazon', 'Technologie Dri-FIT pour évacuer la transpiration, coupe anatomique pour la course et le sport en salle.', '90% Polyester, 10% Spandex', 'active', false),
('Legging Pro Training Adidas', 'Adidas', 'Femmes', 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=600&q=80', 39.95, 4.3, 1876, 8, 'https://amazon.fr', 'Amazon', 'Legging Adidas avec technologie AEROREADY, idéal pour les entraînements intenses.', '79% Polyester recyclé, 21% Elasthanne', 'active', false),
('Legging Sport Homme Compression Under Armour', 'Under Armour', 'Hommes', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80', 49.99, 4.6, 2534, 3, 'https://amazon.fr', 'Amazon', 'Compression légère HeatGear, maintien musculaire optimal pour la musculation et les sports collectifs.', '84% Polyester, 16% Elasthanne', 'active', true),
('Legging Running Homme Nike Pro', 'Nike', 'Hommes', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80', 59.95, 4.4, 987, 7, 'https://amazon.fr', 'Amazon', 'Nike Pro pour hommes, coupe ajustée, technologie Dri-FIT pour la performance au quotidien.', '77% Polyester, 23% Spandex', 'active', false),
('Legging Homme Thermal Training Reebok', 'Reebok', 'Hommes', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80', 34.99, 4.1, 654, 15, 'https://amazon.fr', 'Amazon', 'Legging thermique pour les sports outdoor en hiver, tissu chaud et respirant.', '90% Polyester, 10% Spandex', 'active', false),
('Legging Sport Enfant 4–14 ans Nike', 'Nike', 'Enfants', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80', 24.95, 4.5, 1243, 4, 'https://amazon.fr', 'Amazon', 'Legging enfant léger et confortable, idéal pour l''école et les activités sportives.', '90% Polyester, 10% Elasthanne', 'active', true),
('Legging Fille Multicolore H&M', 'H&M', 'Enfants', 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80', 12.99, 4.2, 432, 18, 'https://amazon.fr', 'Amazon', 'Pack de 2 leggings colorés pour filles, doux et extensibles, parfaits pour le quotidien.', '95% Coton, 5% Elasthanne', 'active', false),
('Legging Sport Haute Performance – Compression X', '2XU', 'Sport', 'https://images.unsplash.com/photo-1549476464-37392f717541?w=600&q=80', 89, 4.8, 3210, 2, 'https://amazon.fr', 'Amazon', 'Compression médicale Grade pour les athlètes de haut niveau. Récupération musculaire accélérée.', '70% Nylon, 30% Lycra', 'active', true),
('Legging Yoga Sport Breathe Easy', 'Sweaty Betty', 'Sport', 'https://images.unsplash.com/photo-1573590330099-d6c7355ec595?w=600&q=80', 75, 4.6, 1876, 6, 'https://amazon.fr', 'Amazon', 'Tissu respirant innovant, parfait pour le Yoga chaud, Pilates et entraînements cardio.', '82% Nylon, 18% Elasthanne', 'active', false),
('Legging Plus Size Taille Haute Confort', 'Torrid', 'Plus Size', 'https://images.unsplash.com/photo-1594750852563-5ed8e0421999?w=600&q=80', 49.99, 4.7, 5621, 1, 'https://amazon.fr', 'Amazon', 'Conçu pour les tailles 1X-6X, tissu stretch 4 directions, ventre plat, confort toute la journée.', '92% Polyester, 8% Spandex', 'active', true),
('Legging Grande Taille Sportswear NYDJ', 'NYDJ', 'Plus Size', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80', 65, 4.4, 2103, 9, 'https://amazon.fr', 'Amazon', 'Legging grande taille avec technologie Lift & Tuck pour un galbe flatteur et un maintien parfait.', '68% Coton, 30% Polyester, 2% Spandex', 'active', false),
('Legging Fashion Velours Côtelé – Bordeaux', 'Zara', 'Fashion', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80', 35.95, 4.3, 876, 3, 'https://amazon.fr', 'Amazon', 'Legging tendance en velours côtelé, coupe droite, parfait pour des tenues chic du quotidien.', '80% Coton, 20% Polyester', 'active', true),
('Legging Mode Cuir Vegan Noir', 'ASOS', 'Fashion', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80', 42, 4.1, 1230, 11, 'https://amazon.fr', 'Amazon', 'Legging effet cuir vegan ultra-tendance, coupe slim, parfait pour les soirées et les tenues mode.', '100% Polyuréthane', 'active', false),
('Legging Floral Print Fashion H&M', 'H&M', 'Fashion', 'https://images.unsplash.com/photo-1594938298603-c8148c4bfba6?w=600&q=80', 19.99, 4, 543, 22, 'https://amazon.fr', 'Amazon', 'Imprimé fleuri romantique, tissu doux jersey, idéal pour les tenues décontractées et les sorties.', '95% Viscose, 5% Elasthanne', 'active', false);
