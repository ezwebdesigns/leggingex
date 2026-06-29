const SUPABASE_URL = `${import.meta.env.VITE_SUPABASE_URL || 'https://vptbrllldcvgykpfljjd.supabase.co'}/rest/v1`;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdGJybGxsZGN2Z3lrcGZsampkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MjEzODEsImV4cCI6MjA5NzQ5NzM4MX0.WwMP2GQiegQoVSly5eS8sXRQsYsGCL33U43GEITNrFI';

const HEADERS = {
  apikey: SUPABASE_KEY,
  'Content-Type': 'application/json',
};

const BASE_SELECT = 'id,title,image_url,price,currency,rating,ratings_count,best_seller_rank,brand,category,categories,affiliate_link,deal_start,deal_end,deal_price,clippable_start,clippable_end,clippable_price,promo_code_start,promo_code_end,promo_code_price,promo_code,variant_images';

// Build a Postgres array-contains filter for the `categories` column.
// Pass the raw value; URLSearchParams handles encoding (double-encode breaks it).
function buildCategoryFilter(category) {
  return `cs.{"${category}"}`;
}

// table defaults to 'products' (full table with all variants).
// Listing pages use 'products_grouped' (grouped view) for deduplicated results.
async function supaFetch(params, table = 'products') {
  const res = await fetch(`${SUPABASE_URL}/${table}?${params}`, { headers: HEADERS });
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

export async function fetchCatalog({ offset = 0, limit = 24, category, brand, minRating, sort = 'rating.desc.nullslast,ratings_count.desc.nullslast', search, marketplace } = {}) {
  const params = new URLSearchParams();
  params.set('is_active', 'eq.true');
  params.set('has_image', 'eq.true');
  params.set('select', BASE_SELECT);
  params.set('order', sort);
  params.set('limit', limit);
  params.set('offset', offset);
  if (marketplace) params.set('marketplace', `eq.${marketplace}`);
  if (category) params.set('categories', buildCategoryFilter(category));
  if (brand) params.set('brand', `eq.${brand}`);
  if (minRating > 0) params.set('rating', `gte.${minRating}`);
  if (search) params.set('title', `ilike.*${search}*`);
  return supaFetch(params, 'products_grouped');
}

// Product detail page uses the full 'products' table (variant_images only exists on products_grouped)
const DETAIL_SELECT = 'id,title,image_url,price,currency,rating,ratings_count,best_seller_rank,brand,category,categories,affiliate_link,deal_start,deal_end,deal_price,clippable_start,clippable_end,clippable_price,promo_code_start,promo_code_end,promo_code_price,promo_code';
export async function fetchProductById(id, marketplace) {
  const params = new URLSearchParams({
    id: `eq.${id}`,
    select: `${DETAIL_SELECT},is_active,asin`,
  });
  if (marketplace) params.set('marketplace', `eq.${marketplace}`);
  return supaFetch(params);
}

// Fetch variants: same title + same marketplace, active, deduplicated by image_url
export async function fetchVariants(title, marketplace) {
  const params = new URLSearchParams();
  params.set('title', `ilike.${title}`);
  params.set('marketplace', `eq.${marketplace}`);
  params.set('is_active', 'eq.true');
  params.set('select', 'id,title,image_url,price');
  params.set('limit', 20);
  const data = await supaFetch(params);
  const seen = new Set();
  return (data || [])
    .filter((p) => p.image_url)
    .filter((p) => {
      if (seen.has(p.image_url)) return false;
      seen.add(p.image_url);
      return true;
    });
}

export async function fetchSimilar({ category, excludeId, limit = 8, marketplace } = {}) {
  const params = new URLSearchParams();
  params.set('is_active', 'eq.true');
  params.set('has_image', 'eq.true');
  params.set('select', BASE_SELECT);
  params.set('order', 'rating.desc.nullslast,ratings_count.desc.nullslast');
  params.set('limit', limit);
  if (marketplace) params.set('marketplace', `eq.${marketplace}`);
  if (category) params.set('categories', buildCategoryFilter(category));
  const data = await supaFetch(params, 'products_grouped');
  return data.filter((p) => p.id !== excludeId);
}

export async function fetchSection(category, limit = 8, marketplace, { sort, brand, minRating } = {}) {
  const params = new URLSearchParams();
  params.set('is_active', 'eq.true');
  params.set('has_image', 'eq.true');
  params.set('select', BASE_SELECT);
  params.set('order', sort || 'rating.desc.nullslast,ratings_count.desc.nullslast');
  params.set('limit', limit);
  if (marketplace) params.set('marketplace', `eq.${marketplace}`);
  params.set('categories', buildCategoryFilter(category));
  if (brand) params.set('brand', `eq.${brand}`);
  if (minRating > 0) params.set('rating', `gte.${minRating}`);
  return supaFetch(params, 'products_grouped');
}

export async function fetchTopProducts(limit = 12, marketplace, { sort, brand, minRating } = {}) {
  const params = new URLSearchParams();
  params.set('is_active', 'eq.true');
  params.set('has_image', 'eq.true');
  params.set('select', BASE_SELECT);
  params.set('order', sort || 'rating.desc.nullslast,ratings_count.desc.nullslast');
  params.set('limit', limit);
  if (marketplace) params.set('marketplace', `eq.${marketplace}`);
  if (brand) params.set('brand', `eq.${brand}`);
  if (minRating > 0) params.set('rating', `gte.${minRating}`);
  return supaFetch(params, 'products_grouped');
}

export async function fetchFilterOptions(marketplace) {
  const params = new URLSearchParams();
  params.set('is_active', 'eq.true');
  params.set('has_image', 'eq.true');
  params.set('select', 'brand');
  params.set('limit', 500);
  if (marketplace) params.set('marketplace', `eq.${marketplace}`);
  const data = await supaFetch(params, 'products_grouped');
  const brands = [...new Set(data.map((p) => p.brand).filter(Boolean))].sort();
  return { brands };
}