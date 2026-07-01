// /api/render.js — version consolidée avec robots.txt et sitemap.xml intégrés.
// Toutes les routes passent par ici ; les assets statiques (JS, CSS, images)
// sont servis par Vercel avant d'atteindre cette fonction grâce à l'ordre
// de priorité natif de Vercel (fichiers statiques > rewrites).

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SITE_NAME = 'Legging Express';
const SITE_ORIGIN = 'https://www.leggingexpress.com';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/og-default.jpg`;

const CATEGORIES = [
  'Biker Shorts','Cycling Shorts','Yoga Pants','High Waisted Leggings',
  'High Waisted Shorts','Gym Shorts','Gym Leggings','Booty Shorts',
  'Booty Leggings','Plus Size Leggings','Plus Size Shorts','Workout Shorts',
  'Workout Leggings','Pack','Leather Leggings','Fashion Leggings',
  'Cropped Leggings','Waist Trainer','Shapewear','Thigh Shorts',
];

// Mapping unique source-de-vérité catégorie <-> slug d'URL.
// Tenu à jour manuellement en miroir de CATEGORY_RULES dans sync-products.js.
const CATEGORY_SLUGS = {
  'Biker Shorts': 'biker-shorts',
  'Cycling Shorts': 'cycling-shorts',
  'Yoga Pants': 'yoga-pants',
  'High Waisted Leggings': 'high-waisted-leggings',
  'High Waisted Shorts': 'high-waisted-shorts',
  'Gym Shorts': 'gym-shorts',
  'Gym Leggings': 'gym-leggings',
  'Booty Shorts': 'booty-shorts',
  'Booty Leggings': 'booty-leggings',
  'Plus Size Leggings': 'plus-size-leggings',
  'Plus Size Shorts': 'plus-size-shorts',
  'Workout Shorts': 'workout-shorts',
  'Workout Leggings': 'workout-leggings',
  'Pack': 'pack',
  'Leather Leggings': 'leather-leggings',
  'Fashion Leggings': 'fashion-leggings',
  'Cropped Leggings': 'cropped-leggings',
  'Waist Trainer': 'waist-trainer',
  'Shapewear': 'shapewear',
  'Thigh Shorts': 'thigh-shorts',
};
const SLUG_TO_CATEGORY = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([category, slug]) => [slug, category])
);

const STATIC_PAGES = [
  { path: '/',           changefreq: 'daily',   priority: '1.0' },
  { path: '/catalogue',  changefreq: 'hourly',  priority: '0.9' },
  { path: '/blog',       changefreq: 'weekly',  priority: '0.7' },
  { path: '/about',      changefreq: 'monthly', priority: '0.4' },
  { path: '/contact',    changefreq: 'monthly', priority: '0.4' },
  { path: '/terms',      changefreq: 'monthly', priority: '0.3' },
  { path: '/privacy',    changefreq: 'monthly', priority: '0.3' },
  { path: '/disclaimer', changefreq: 'monthly', priority: '0.3' },
];

// ---------------------------------------------------------------------------
// Handler principal
// ---------------------------------------------------------------------------

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = `https://${host}`;
  const url = new URL(req.url, origin);

  if (url.pathname === '/catalogue/high-waisted-leggings' || url.search.includes('debug-render')) {
    return res.status(200).json({
      pathname: url.pathname,
      search: url.search,
      reqUrl: req.url,
      host: origin,
    });
  }

  if (url.pathname.startsWith('/debug-params')) {
    return res.status(200).json({
      pathname: url.pathname,
      search: url.search,
      allParams: Object.fromEntries(url.searchParams),
    });
  }

  // robots.txt
  if (url.pathname === '/robots.txt') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=86400');
    return res.status(200).send(
      `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml`
    );
  }

  // sitemap.xml
  if (url.pathname === '/sitemap.xml') {
    return handleSitemap(res);
  }

  // Redirection 301 : ancien format ?category=Gym+Leggings -> nouveau
  // chemin /catalogue/gym-leggings. Préserve le SEO déjà accumulé sur les
  // anciens liens plutôt que de les laisser pendre dans le vide.
  if (url.pathname === '/catalogue' && url.searchParams.has('category')) {
    const rawCategory = url.searchParams.get('category');
    const slug = CATEGORY_SLUGS[rawCategory];
    if (slug) {
      res.setHeader('Location', `${SITE_ORIGIN}/catalogue/${slug}`);
      return res.status(301).end();
    }
    // Catégorie inconnue dans le mapping : on laisse passer vers le
    // catalogue général plutôt que de casser la requête.
  }

  // Toutes les autres routes → injecter les meta dans la coquille HTML
  let meta;
  try {
    meta = await buildMeta(url);
  } catch (err) {
    console.error('render.js buildMeta error:', err);
    meta = {
      title: `${SITE_NAME} — Find your perfect pair`,
      description: 'Discover the best leggings for women, men, kids, sports and fashion.',
      image: DEFAULT_IMAGE,
      canonical: `${SITE_ORIGIN}${url.pathname}`,
    };
  }

  const shellRes = await fetch(`${origin}/_shell.html`);
  let html = await shellRes.text();

  html = html
    .replaceAll('META_TITLE',       escapeHtml(meta.title))
    .replaceAll('META_DESCRIPTION', escapeHtml(meta.description))
    .replaceAll('META_OG_TITLE',    escapeHtml(meta.title))
    .replaceAll('META_OG_DESCRIPTION', escapeHtml(meta.description))
    .replaceAll('META_OG_IMAGE',    escapeHtml(meta.image))
    .replaceAll('META_OG_URL',      escapeHtml(meta.canonical))
    .replaceAll('META_CANONICAL_URL', escapeHtml(meta.canonical))
    .replace('META_JSON_LD',
      meta.jsonLd ? `<script type="application/ld+json">${meta.jsonLd}</script>` : ''
    );

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  return res.status(200).send(html);
}

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------

async function handleSitemap(res) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [caRows, usRows, blogPosts] = await Promise.all([
      fetchProducts('amazon.ca'),
      fetchProducts('amazon.com'),
      fetchBlogPosts(),
    ]);

    const urls = [
      ...STATIC_PAGES.map(({ path, changefreq, priority }) =>
        sitemapUrl(SITE_ORIGIN + path, today, changefreq, priority)
      ),
      ...CATEGORIES.map((cat) =>
        sitemapUrl(
          `${SITE_ORIGIN}/catalogue/${CATEGORY_SLUGS[cat]}`,
          today, 'hourly', '0.8'
        )
      ),
      ...[...caRows, ...usRows].map((p) =>
        sitemapUrl(
          `${SITE_ORIGIN}/produit/${p.id}`,
          p.last_seen_at ? p.last_seen_at.split('T')[0] : today,
          'daily', '0.6'
        )
      ),
      ...blogPosts.map((post) =>
        sitemapUrl(
          `${SITE_ORIGIN}/${post.slug}`,
          post.published_at ? post.published_at.split('T')[0] : today,
          'weekly', '0.7'
        )
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('render.js handleSitemap error:', err);
    return res.status(500).send('Error generating sitemap');
  }
}

function sitemapUrl(loc, lastmod, changefreq, priority) {
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

async function fetchProducts(marketplace) {
  const rows = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products_grouped` +
      `?is_active=eq.true&has_image=eq.true` +
      `&marketplace=eq.${encodeURIComponent(marketplace)}` +
      `&select=id,last_seen_at&limit=${limit}&offset=${offset}`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    rows.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }
  return rows;
}

async function fetchBlogPosts() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/Page?type=eq.blog_post&published=eq.true&select=slug,published_at`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
  } catch { return []; }
}

// ---------------------------------------------------------------------------
// Meta tags
// ---------------------------------------------------------------------------

async function buildMeta(url) {
  const path = url.searchParams.get('__path');
  const pathname = url.pathname;

  const produitMatch = pathname.match(/^\/produit\/([^/]+)$/);
  const categorieMatch = pathname.match(/^\/catalogue\/([^/]+)$/);

  const canonical = `${SITE_ORIGIN}${pathname}`;

  if (produitMatch) {
    const id = produitMatch[1];
    return buildProductMeta(id, canonical);
  }

  if (categorieMatch) {
    const slug = categorieMatch[1];
    return buildCategoryMeta(slug, canonical);
  }

  if (pathname === '/catalogue') return buildCatalogueMeta(canonical);

  return {
    title: `${SITE_NAME} — Find Your Perfect Leggings`,
    description: 'Shop the best leggings, biker shorts, yoga pants and activewear for women. Compare ratings, prices and bestsellers from top brands on Amazon CA and US.',
    image: DEFAULT_IMAGE,
    canonical,
  };
}

async function buildCategoryMeta(slug, canonical) {
  const category = SLUG_TO_CATEGORY[slug];

  if (!category) {
    return {
      title: `Category not found | ${SITE_NAME}`,
      description: `This category doesn't exist on ${SITE_NAME}.`,
      image: DEFAULT_IMAGE,
      canonical,
    };
  }

  let content = null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/category_content?slug=eq.${slug}&select=intro_html,faq`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    const rows = await res.json();
    content = rows?.[0] ?? null;
  } catch (err) {
    console.error('category_content fetch error:', err);
  }

  let jsonLd = '';
  if (content?.faq?.length > 0) {
    jsonLd = `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: content.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    })}</script>`;
  }

  return {
    title: `${category} — Shop the best picks | ${SITE_NAME}`,
    description: content?.intro_html
      ? content.intro_html.replace(/<[^>]+>/g, '').substring(0, 160)
      : `Discover the best ${category.toLowerCase()} available on Amazon. Compare prices, ratings and best sellers.`,
    image: DEFAULT_IMAGE,
    canonical,
    jsonLd,
  };
}

async function buildProductMeta(id, canonical) {
  const fields = 'id,title,image_url,price,currency,rating,ratings_count,brand,is_active,affiliate_link';
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=${fields}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  const rows = await res.json();
  const p = rows?.[0];

  if (!p) return {
    title: `Product not found | ${SITE_NAME}`,
    description: `This product is no longer available on ${SITE_NAME}.`,
    image: DEFAULT_IMAGE, canonical,
  };

  const title = `${p.title}${p.brand ? ` | ${p.brand}` : ''} — ${SITE_NAME}`;
  const ratingPart = p.rating ? ` Rated ${p.rating}/5 (${p.ratings_count ?? 0} reviews).` : '';
  const availabilityPart = p.is_active ? 'Available now.' : 'Currently unavailable — see similar items.';
  const description = `${p.currency} $${p.price} on Amazon.${ratingPart} ${availabilityPart}`;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product',
    name: p.title, image: p.image_url,
    ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
    ...(p.rating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.ratings_count ?? 0 } } : {}),
    offers: { '@type': 'Offer', price: p.price, priceCurrency: p.currency,
      availability: p.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: p.affiliate_link },
  });

  return { title, description, image: p.image_url || DEFAULT_IMAGE, canonical, jsonLd };
}

async function buildCatalogueMeta(canonical) {
  return {
    title: `Catalogue — ${SITE_NAME}`,
    description: 'Browse our full catalogue of leggings, shorts and activewear.',
    image: DEFAULT_IMAGE, canonical,
  };
}

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

function escapeHtml(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escapeXml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}
