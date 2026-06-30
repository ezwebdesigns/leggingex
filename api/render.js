// /api/render.js
// Intercepte /produit/:id et /catalogue (voir vercel.json) pour injecter des
// balises <title>/meta/OG/JSON-LD correctes dans le HTML, AVANT exécution du
// JS — donc visible par tous les bots (Google, réseaux sociaux, IA), pas
// seulement par les vrais navigateurs.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://vptbrllldcvgykpfljjd.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdGJybGxsZGN2Z3lrcGZsampkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MjEzODEsImV4cCI6MjA5NzQ5NzM4MX0.WwMP2GQiegQoVSly5eS8sXRQsYsGCL33U43GEITNrFI';
const SITE_NAME = 'Legging Express';
const SITE_ORIGIN = 'https://www.leggingexpress.com';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/og-default.jpg`;

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = `https://${host}`;
  const url = new URL(req.url, origin);

  if (url.pathname === '/robots.txt') {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 's-maxage=86400');
    res.status(200).send(
      `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://www.leggingexpress.com/sitemap.xml`
    );
    return;
  }

  let meta;
  try {
    meta = await buildMeta(url);
  } catch (err) {
    console.error('api/render.js buildMeta error:', err);
    // Si la donnée (Supabase, etc.) échoue, on retombe sur des valeurs
    // génériques mais réelles — jamais sur les tokens bruts.
    meta = {
      title: `${SITE_NAME} — Find your perfect pair`,
      description: 'Discover the best leggings for women, men, kids, sports and fashion.',
      image: DEFAULT_IMAGE,
      canonical: `${SITE_ORIGIN}${url.pathname}`,
    };
  }

  const shellRes = await fetch(`${origin}/index.html`);
  let html = await shellRes.text();

  html = html
    .replaceAll('__TITLE__', escapeHtml(meta.title))
    .replaceAll('__DESCRIPTION__', escapeHtml(meta.description))
    .replaceAll('__OG_TITLE__', escapeHtml(meta.title))
    .replaceAll('__OG_DESCRIPTION__', escapeHtml(meta.description))
    .replaceAll('__OG_IMAGE__', escapeHtml(meta.image))
    .replaceAll('__OG_URL__', escapeHtml(meta.canonical))
    .replaceAll('__CANONICAL_URL__', escapeHtml(meta.canonical))
    .replace(
      '__JSON_LD__',
      meta.jsonLd ? `<script type="application/ld+json">${meta.jsonLd}</script>` : ''
    );

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Cache 5 min côté edge Vercel : évite de retaper Supabase à chaque crawl
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.status(200).send(html);
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function buildMeta(url) {
  const path = url.searchParams.get('__path'); // 'produit' | 'catalogue'
  const canonical = `${SITE_ORIGIN}${url.pathname}${url.search.replace(/[?&]__path=[^&]*/, '')}`;

  if (path === 'produit') {
    return buildProductMeta(url, canonical);
  }
  if (path === 'catalogue') {
    return buildCatalogueMeta(url, canonical);
  }
  return {
    title: `${SITE_NAME} — Find your perfect pair`,
    description: 'Discover the best leggings for women, men, kids, sports and fashion.',
    image: DEFAULT_IMAGE,
    canonical,
  };
}

async function buildProductMeta(url, canonical) {
  const id = url.searchParams.get('id');
  const fields = 'id,title,image_url,price,currency,rating,ratings_count,brand,is_active,affiliate_link';

  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=${fields}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  const rows = await res.json();
  const p = rows?.[0];

  if (!p) {
    return {
      title: `Product not found | ${SITE_NAME}`,
      description: `This product is no longer available on ${SITE_NAME}.`,
      image: DEFAULT_IMAGE,
      canonical,
    };
  }

  const title = `${p.title}${p.brand ? ` | ${p.brand}` : ''} — ${SITE_NAME}`;
  const ratingPart = p.rating ? ` Rated ${p.rating}/5 (${p.ratings_count ?? 0} reviews).` : '';
  const availabilityPart = p.is_active ? 'Available now.' : 'Currently unavailable — see similar items.';
  const description = `${p.currency} $${p.price} on Amazon.${ratingPart} ${availabilityPart}`;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    image: p.image_url,
    ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
    ...(p.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: p.rating,
            reviewCount: p.ratings_count ?? 0,
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      price: p.price,
      priceCurrency: p.currency,
      availability: p.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: p.affiliate_link,
    },
  });

  return { title, description, image: p.image_url || DEFAULT_IMAGE, canonical, jsonLd };
}

async function buildCatalogueMeta(url, canonical) {
  const category = url.searchParams.get('category');

  if (category) {
    return {
      title: `${category} — Shop the best picks | ${SITE_NAME}`,
      description: `Discover the best ${category.toLowerCase()} available on Amazon. Compare prices, ratings and best sellers.`,
      image: DEFAULT_IMAGE,
      canonical,
    };
  }

  return {
    title: `Catalogue — ${SITE_NAME}`,
    description: 'Browse our full catalogue of leggings, shorts and activewear.',
    image: DEFAULT_IMAGE,
    canonical,
  };
}
