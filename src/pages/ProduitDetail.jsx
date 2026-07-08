import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Copy, Check, CheckCircle2 } from 'lucide-react';
import StarRating from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { fetchProductById, fetchVariants, fetchSimilar } from '@/lib/supabaseApi';
import { useCountry } from '@/contexts/CountryContext';
import { CATEGORY_SLUGS } from '@/lib/categorySlugs';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function ProduitDetail() {
  const { id } = useParams();
  const { marketplace, currencyPrefix } = useCountry();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const now = new Date();

  const metaProductTitle = product?.title;
  usePageMeta({
    title: metaProductTitle ? `${metaProductTitle} | ${product.brand || 'Legging Express'} — Legging Express` : undefined,
    description: metaProductTitle && product.price != null
      ? `${currencyPrefix}${Number(product.price).toFixed(2)} on Amazon. Rated ${product.rating || '?'}/5.`
      : undefined,
    ogImage: product?.image_url || undefined,
    canonical: id ? `/produit/${id}` : undefined,
  });

  const isDealActive = product?.deal_start && product?.deal_end &&
    new Date(product.deal_start) <= now && new Date(product.deal_end) >= now;
  const isClippableActive = product?.clippable_start && product?.clippable_end &&
    new Date(product.clippable_start) <= now && new Date(product.clippable_end) >= now;
  const isPromoActive = product?.promo_code_start && product?.promo_code_end &&
    new Date(product.promo_code_start) <= now && new Date(product.promo_code_end) >= now;
  const isBestSeller = product?.best_seller_rank != null && product.best_seller_rank <= 100;

  const copyPromo = () => {
    if (product?.promo_code) {
      navigator.clipboard.writeText(product.promo_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      setVariants([]);
      setSimilarProducts([]);

      const data = await fetchProductById(id, marketplace);
      if (!data || data.length === 0) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const p = data[0];
      setProduct(p);

      if (!p.is_active) {
        let sims = await fetchSimilar({ category: p.category, marketplace, limit: 8 });
        if (!sims || sims.length === 0) {
          sims = await fetchSimilar({ marketplace, limit: 8 });
        }
        setSimilarProducts(sims.filter((s) => s.id !== p.id).slice(0, 8));
        setLoading(false);
        return;
      }

      const [variantsData, simsData] = await Promise.all([
        fetchVariants(p.title, marketplace),
        (async () => {
          const cat = p.categories?.[0] || p.category;
          if (!cat) return [];
          let sims = await fetchSimilar({ category: cat, marketplace, limit: 8 });
          if (!sims || sims.length === 0) {
            sims = await fetchSimilar({ marketplace, limit: 8 });
          }
          return sims.filter((s) => s.id !== p.id).slice(0, 8);
        })(),
      ]);

      setVariants(variantsData || []);
      setSimilarProducts(simsData || []);
      setLoading(false);
    };
    load();
  }, [id, marketplace]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-6 w-24 bg-muted rounded mb-6" />
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 h-[591px] bg-muted rounded-3xl" />
            <div className="flex-1 space-y-4 pt-4">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-7 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-14 bg-muted rounded-2xl mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <span className="text-5xl mb-4">🔍</span>
        <h2 className="text-xl font-semibold mb-2">Product not found</h2>
        <p className="text-sm text-muted-foreground mb-5">This product doesn't exist or has been removed.</p>
        <Link to="/catalogue" className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
          Back to catalogue
        </Link>
      </div>
    );
  }

  const categories = product.categories?.length > 0 ? product.categories : (product.category ? [product.category] : []);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-16 bg-background/95 backdrop-blur-sm border-b border-border z-30 px-4 lg:px-14 py-3">
        <Link to="/catalogue" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to catalogue</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-14 py-6">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          <div className="flex-1">
            <div className="flex-1 h-[591px] rounded-3xl overflow-hidden bg-white shadow-lg flex items-center justify-center p-4">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              ) : (
                <div className="flex items-center justify-center text-8xl">👖</div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 pt-2">
            {product.brand && (
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">{product.brand}</p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{product.title}</h1>

            {categories.length > 0 && product.is_active && (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <Link key={cat} to={`/catalogue/${CATEGORY_SLUGS[cat] || encodeURIComponent(cat)}`}
                    className="px-3 py-1 rounded-full text-[10px] font-medium bg-secondary border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                    {cat}
                  </Link>
                ))}
              </div>
            )}

            {product.rating && (
              <div className="flex items-center gap-2">
                <StarRating rating={product.rating} size="lg" />
                <span className="text-base font-semibold">{product.rating.toFixed(1)}</span>
                {product.ratings_count && (
                  <span className="text-sm text-muted-foreground">
                    ({product.ratings_count >= 1000 ? `${(product.ratings_count / 1000).toFixed(1)}k` : product.ratings_count} reviews)
                  </span>
                )}
              </div>
            )}

            {product.is_active && (
              <div className="flex flex-wrap gap-2">
                {isBestSeller && (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                    Best Seller
                  </span>
                )}
                {isDealActive && (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                    Limited Offer
                  </span>
                )}
              </div>
            )}

            {product.is_active && (
              <div className="space-y-1">
                {isDealActive ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-red-600">{currencyPrefix}{Number(product.deal_price).toFixed(2)}</span>
                    <span className="text-base text-muted-foreground line-through">{currencyPrefix}{Number(product.price).toFixed(2)}</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-foreground">{currencyPrefix}{Number(product.price).toFixed(2)}</p>
                )}

                {isClippableActive && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                    Clip Coupon on Amazon before this price applies
                  </p>
                )}

                {isPromoActive && product.promo_code && (
                  <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="text-xs font-semibold text-blue-700">Promo code:</span>
                    <code className="text-sm font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200">{product.promo_code}</code>
                    <button onClick={copyPromo} className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 transition-colors">
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {variants.length > 0 && product.is_active && (
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <Link key={v.id} to={`/produit/${v.id}`} className="relative inline-block">
                    <div className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      v.id === id ? 'border-primary' : 'border-border/50 hover:border-primary/50'
                    }`}>
                      <img src={v.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    {v.id === id && (
                      <CheckCircle2 className="absolute -top-1.5 -right-1.5 w-5 h-5 text-primary bg-white rounded-full" />
                    )}
                  </Link>
                ))}
              </div>
            )}

            {!product.is_active ? (
              <div className="mt-4 p-4 bg-muted rounded-2xl">
                <p className="text-sm font-medium text-muted-foreground text-center">This product is no longer available.</p>
              </div>
            ) : (
              <div className="mt-auto pt-4">
                <a href={product.affiliate_link} target="_blank" rel="noopener noreferrer sponsored" className="block w-full">
                  <Button className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg shadow-black/20 bg-black text-white hover:bg-black/90 flex items-center gap-3 transition-opacity">
                    <img src="/amazon-logo.svg" alt="Amazon" className="h-8 w-auto" />
                    View on Amazon
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
                <p className="text-center text-xs text-muted-foreground mt-2">Affiliate link — you will be redirected to the partner site</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="border-t border-border mt-12">
          <div className="px-4 lg:px-14 py-10">
            <h2 className="text-xl font-bold text-foreground mb-6">You might also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {similarProducts.map((p) => {
                const isDeal = p.deal_start && p.deal_end && new Date(p.deal_start) <= now && new Date(p.deal_end) >= now;
                return (
                  <Link key={p.id} to={`/produit/${p.id}`} className="group flex flex-col w-full rounded-2xl overflow-hidden bg-card transition-all duration-300">
                    <div className="w-full aspect-square overflow-hidden bg-[#F5F5F5] relative rounded-2xl border border-border/50">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">👖</div>
                      )}
                    </div>
                    <div className="pt-2 pb-1 px-1 space-y-0.5 bg-card">
                      {p.brand && <p className="text-[10px] font-semibold uppercase tracking-wider text-primary truncate leading-none">{p.brand}</p>}
                      <p className="text-xs font-bold text-foreground line-clamp-1 leading-tight">{p.title}</p>
                      {p.rating && (
                        <div className="flex items-center gap-1 leading-none">
                          <StarRating rating={p.rating} size="md" />
                          <span className="text-[10px] font-medium text-muted-foreground">{p.rating.toFixed(1)}</span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1.5 pt-0.5 leading-none">
                        <span className="text-xs font-bold text-foreground">{Number(isDeal ? p.deal_price : p.price).toFixed(2)} {currencyPrefix}</span>
                        {isDeal && Number(p.deal_price) < Number(p.price) && (
                          <span className="text-[10px] text-muted-foreground line-through">{Number(p.price).toFixed(2)} {currencyPrefix}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
