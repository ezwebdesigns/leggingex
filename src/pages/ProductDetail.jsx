import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { ExternalLink, ArrowLeft, Award, Users, TrendingUp, Tag } from 'lucide-react';
import StarRating from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { useCountry } from '@/contexts/CountryContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { currencyPrefix } = useCountry();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data: single } = await supabase
          .from('b44_products')
          .select('*')
          .eq('id', id)
          .single();
        const found = single || null;
        setProduct(found);

        if (found) {
          const { data: rel } = await supabase
            .from('b44_products')
            .select('*')
            .eq('category', found.category)
            .eq('status', 'active')
            .order('best_seller_rank', { ascending: true })
            .limit(5);
          setRelated((rel || []).filter((p) => p.id !== found.id).slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-6 w-24 bg-muted rounded mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-[3/4] bg-muted rounded-3xl" />
            <div className="space-y-4 pt-4">
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

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <span className="text-5xl mb-4">🔍</span>
        <h2 className="text-xl font-semibold mb-2">Product not found</h2>
        <Link to="/" className="text-primary text-sm font-medium hover:underline mt-2">
          Back to home
        </Link>
      </div>
    );
  }

  const siteName = product.affiliate_site || 'Amazon';

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-16 bg-background/95 backdrop-blur-sm border-b border-border z-30 px-4 lg:px-14 py-3">
        <Link
          to={-1}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-14 py-6">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="relative">
            <div className="rounded-3xl overflow-hidden bg-muted aspect-[3/4]">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl">👖</span>
                </div>
              )}
            </div>

            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.best_seller_rank && product.best_seller_rank <= 10 && (
                <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg">
                  #1 Best Seller
                </span>
              )}
              {product.category && (
                <span className="px-3 py-1 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium rounded-full shadow">
                  {product.category}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{product.brand}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight tracking-tight mb-3">
                {product.name}
              </h1>

              {product.rating && (
                <div className="flex items-center gap-2 mb-1">
                  <StarRating rating={product.rating} size="lg" />
                  <span className="text-base font-semibold text-foreground">{product.rating.toFixed(1)}</span>
                  {product.reviews_count && (
                    <span className="text-sm text-muted-foreground">
                      ({product.reviews_count >= 1000
                        ? `${(product.reviews_count / 1000).toFixed(1)}k`
                        : product.reviews_count} reviews)
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {product.reviews_count && (
                <div className="flex items-center gap-2.5 p-3 bg-secondary rounded-2xl">
                  <Users className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Reviews</p>
                    <p className="text-sm font-semibold">
                      {product.reviews_count >= 1000
                        ? `${(product.reviews_count / 1000).toFixed(1)}k`
                        : product.reviews_count}
                    </p>
                  </div>
                </div>
              )}
              {product.best_seller_rank && (
                <div className="flex items-center gap-2.5 p-3 bg-secondary rounded-2xl">
                  <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Rank</p>
                    <p className="text-sm font-semibold">#{product.best_seller_rank}</p>
                  </div>
                </div>
              )}
              {product.price && (
                <div className="flex items-center gap-2.5 p-3 bg-secondary rounded-2xl">
                  <Tag className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Indicative Price</p>
                    <p className="text-sm font-semibold">{currencyPrefix}{product.price.toFixed(2)}</p>
                  </div>
                </div>
              )}
              {product.material && (
                <div className="flex items-center gap-2.5 p-3 bg-secondary rounded-2xl">
                  <Award className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Material</p>
                    <p className="text-sm font-semibold">{product.material}</p>
                  </div>
                </div>
              )}
            </div>

            {product.description && (
              <div className="bg-muted/50 rounded-2xl p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="mt-auto pt-2">
              <a
                href={product.affiliate_url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="w-full"
              >
                <Button className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg shadow-primary/20 flex items-center gap-2 hover:opacity-90 transition-opacity">
                  View on {siteName}
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
              <p className="text-center text-xs text-muted-foreground mt-2">
                Affiliate link — you will be redirected to {siteName}
              </p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Also in {product.category}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {related.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="group block rounded-2xl overflow-hidden bg-card border border-border/50 hover:shadow-md transition-all duration-300">
                  <div className="aspect-[3/4] bg-muted overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">👖</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{p.brand}</p>
                    <p className="text-sm font-medium line-clamp-2 mt-0.5">{p.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}