// /api/sitemap.js
// Génère un sitemap.xml dynamique en tirant les produits actifs et les pages
// statiques depuis Supabase. À chaque visite de Googlebot, le sitemap est
// à jour — pas besoin de redéployer après chaque run du cron de sync.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SITE_ORIGIN = 'https://www.leggingexpress.com';

// Pages statiques avec leurs priorités et fréquences de mise à jour
const STATIC_PAGES = [
  { path: '/',             changefreq: 'daily',   priority: '1.0' },
  { path: '/catalogue',   changefreq: 'hourly',  priority: '0.9' },
  { path: '/blog',         changefreq: 'weekly',  priority: '0.7' },
  { path: '/about',        changefreq: 'monthly', priority: '0.4' },
  { path: '/contact',      changefreq: 'monthly', priority: '0.4' },
  { path: '/terms',        changefreq: 'monthly', priority: '0.3' },
  { path: '/privacy',      changefreq: 'monthly', priority: '0.3' },
  { path: '/disclaimer',   changefreq: 'monthly', priority: '0.3' },
];

// Catégories — doit correspondre exactement à CATEGORY_RULES dans sync-products.js
const CATEGORIES = [
  'Biker Shorts',
  'Cycling Shorts',
  'Yoga Pants',
  'High Waisted Leggings',
  'High Waisted Shorts',
  'Gym Shorts',
  'Gym Leggings',
  'Booty Shorts',
  'Booty Leggings',
  'Plus Size Leggings',
  'Plus Size Shorts',
  'Workout Shorts',
  'Workout Leggings',
  'Pack',
  'Leather Leggings',
  'Fashion Leggings',
  'Cropped Leggings',
  'Waist Trainer',
  'Shapewear',
  'Thigh Shorts',
];

const CATEGORY_SLUGS = Object.fromEntries(CATEGORIES.map(c => [c, c.toLowerCase().replace(/\s+/g, '-')]));

export default async function handler(req, res) {
  try {
    // On sépare la récupération CA/US pour avoir une lastmod propre par
    // marketplace si on veut plus tard — pour l'instant on les fusionne.
    const [caRows, usRows, blogPosts] = await Promise.all([
      fetchProducts('amazon.ca'),
      fetchProducts('amazon.com'),
      fetchBlogPosts(),
    ]);

    const allProducts = [...caRows, ...usRows];
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const urls = [
      // Pages statiques
      ...STATIC_PAGES.map(({ path, changefreq, priority }) =>
        url(SITE_ORIGIN + path, today, changefreq, priority)
      ),

      // Pages de catégorie — une URL slug friendly par catégorie
      ...CATEGORIES.map((cat) =>
        url(
          `${SITE_ORIGIN}/catalogue/${CATEGORY_SLUGS[cat]}`,
          today,
          'hourly',
          '0.8'
        )
      ),

      // Pages produit
      ...allProducts.map((p) =>
        url(
          `${SITE_ORIGIN}/produit/${p.id}`,
          // last_seen_at = date de la dernière synchronisation du feed
          // → permet à Google de savoir si le produit a été mis à jour
          p.last_seen_at ? p.last_seen_at.split('T')[0] : today,
          'daily',
          '0.6'
        )
      ),

      // Articles de blog
      ...blogPosts.map((post) =>
        url(
          `${SITE_ORIGIN}/${post.slug}`,
          post.published_at ? post.published_at.split('T')[0] : today,
          'weekly',
          '0.7'
        )
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    // Cache 1h côté edge : évite de taper Supabase à chaque passage de crawler
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    res.status(200).send(xml);
  } catch (err) {
    console.error('api/sitemap.js error:', err);
    res.status(500).send('Error generating sitemap');
  }
}

function url(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchProducts(marketplace) {
  // On utilise products_grouped (vue déduplication) plutôt que la table brute
  // pour éviter de lister 544 URLs pour le même produit CAMPSNAIL.
  // Pagination par lots de 1000 (limite PostgREST par défaut).
  const rows = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products_grouped` +
      `?is_active=eq.true&has_image=eq.true` +
      `&marketplace=eq.${encodeURIComponent(marketplace)}` +
      `&select=id,last_seen_at` +
      `&limit=${limit}&offset=${offset}`,
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
      `${SUPABASE_URL}/rest/v1/Page` +
      `?type=eq.blog_post&published=eq.true` +
      `&select=slug,published_at`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
  } catch {
    // Si la table Page n'existe pas encore ou que le fetch échoue,
    // on ne plante pas le sitemap entier — juste pas d'articles.
    return [];
  }
}
