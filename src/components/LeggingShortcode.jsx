import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const KNOWN_SORTS = ['rating', 'best', 'price'];

const KNOWN_CATEGORIES = [
  'Biker Shorts', 'Cycling Shorts', 'Yoga Pants', 'High Waisted Leggings',
  'High Waisted Shorts', 'Gym Shorts', 'Gym Leggings', 'Booty Shorts',
  'Booty Leggings', 'Plus Size Leggings', 'Plus Size Shorts', 'Workout Shorts',
  'Workout Leggings', 'Pack', 'Leather Leggings', 'Fashion Leggings',
  'Cropped Leggings', 'Waist Trainer', 'Shapewear', 'Thigh Shorts',
  'Flare Leggings', 'Capri Leggings', 'Fleece Leggings', 'Black Leggings',
  'Scrunch Leggings', 'Scrunch Shorts', 'Leggings with Pockets',
  'Butt Shorts', 'Butt Leggings',
];

function normalizeCategory(input) {
  const lower = input.toLowerCase().trim();
  return KNOWN_CATEGORIES.find((c) => c.toLowerCase() === lower) || input;
}

function StarPath() {
  return 'M10 1l2.5 7.5H20l-6 4.5 2.5 7.5L10 15l-6.5 5L6 13l-6-4.5h7.5z';
}

function StarSvg({ fill, half }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20">
      {half ? (
        <>
          <path d={StarPath()} fill="#e5e7eb" />
          <path d={StarPath()} fill="#facc15" style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </>
      ) : (
        <path d={StarPath()} fill={fill} />
      )}
    </svg>
  );
}

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const fraction = rating - full;
  const visualFull = fraction >= 0.7 ? full + 1 : full;
  const visualHalf = fraction >= 0.3 && fraction < 0.7 ? 1 : 0;
  const visualEmpty = 5 - visualFull - visualHalf;

  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: visualFull }).map((_, i) => (
        <StarSvg key={`f${i}`} fill="#facc15" />
      ))}
      {visualHalf > 0 && <StarSvg half />}
      {Array.from({ length: visualEmpty }).map((_, i) => (
        <StarSvg key={`e${i}`} fill="#e5e7eb" />
      ))}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-4 animate-pulse">
      <div className="w-48 h-48 flex-shrink-0 rounded-xl bg-muted" />
      <div className="flex-1 space-y-3 py-2">
        <div className="h-3 bg-muted rounded w-1/4" />
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-1/3 mt-4" />
      </div>
    </div>
  );
}

export default function LeggingShortcode({ category, sort, limit = 10, marketplace }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);

      const isBrandFilter = sort && !KNOWN_SORTS.includes(sort.toLowerCase());

      const params = new URLSearchParams({
        is_active: 'eq.true',
        has_image: 'eq.true',
        select:    'id,title,image_url,price,currency,rating,ratings_count,best_seller_rank,brand,affiliate_link,categories,marketplace',
        limit:     String(Math.min(limit, 20)),
      });

      const normalizedCategory = normalizeCategory(category);
      if (normalizedCategory) {
        params.set('categories', `cs.{"${normalizedCategory}"}`);
      }

      if (marketplace) {
        params.set('marketplace', `eq.${marketplace === 'CA' ? 'amazon.ca' : 'amazon.com'}`);
      }

      if (isBrandFilter) {
        params.set('brand', `ilike.*${sort}*`);
        params.set('order', 'rating.desc.nullslast,ratings_count.desc.nullslast');
      } else if (sort === 'price') {
        params.set('order', 'price.asc.nullslast');
      } else if (sort === 'best') {
        params.set('order', 'best_seller_rank.asc.nullslast');
      } else {
        params.set('order', 'rating.desc.nullslast,ratings_count.desc.nullslast');
      }

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products_grouped?${params.toString()}`,
        {
          headers: {
            apikey:        SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    }

    fetchProducts();
  }, [category, sort, limit, marketplace]);

  if (loading) return (
    <div className="not-prose space-y-4 my-8">
      {Array.from({ length: Math.min(limit, 3) }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );

  if (!products.length) return null;

  return (
    <div className="not-prose space-y-4 my-8">
      {products.map((p, index) => {
        // Première catégorie du produit comme badge
        const badge = p.categories?.[0] ?? null;
        const currencyPrefix = p.currency === 'CAD' ? 'CA$' : 'US$';

        return (
          <div
            key={p.id}
            className="flex flex-col sm:flex-row gap-0 rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image + numéro */}
            <div className="relative w-full sm:w-52 flex-shrink-0">
              <div className="absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold shadow">
                #{index + 1}
              </div>
              <img
                src={p.image_url}
                alt={p.title}
                loading="lazy"
                className="w-full sm:w-52 h-52 object-cover"
              />
            </div>

            {/* Contenu */}
            <div className="flex flex-col justify-between flex-1 p-4 gap-3">
              {/* Header : badge + rating */}
              <div className="flex items-start justify-between gap-2">
                {badge && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border/50">
                    {badge}
                  </span>
                )}
                {p.rating && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <StarRating rating={p.rating} />
                    <span className="text-sm font-semibold">{p.rating.toFixed(2)} / 5</span>
                    {p.ratings_count && (
                      <span className="text-xs text-muted-foreground">
                        ({p.ratings_count >= 1000
                          ? `${(p.ratings_count / 1000).toFixed(1)}k`
                          : p.ratings_count})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Titre */}
              <div>
                {p.brand && (
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                    {p.brand}
                  </p>
                )}
                <Link to={`/produit/${p.id}`} className="text-base font-bold text-foreground hover:underline leading-snug">
                  {p.title}
                </Link>
              </div>

              {/* Footer : prix + CTA */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Price</p>
                  <p className="text-lg font-bold text-foreground">
                    {currencyPrefix}{Number(p.price).toFixed(2)}
                  </p>
                </div>
                <a
                  href={p.affiliate_link}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity flex-shrink-0"
                >
                  View on Amazon
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
