import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { fetchProductById, fetchSimilar } from '@/lib/supabaseApi';
import { useCountry } from '@/contexts/CountryContext';

function StarRating({ rating, size = 'md' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          strokeWidth={0}
          className={`${cls} ${i <= Math.round(rating) ? 'fill-yellow-400' : 'fill-gray-200'}`}
        />
      ))}
    </span>
  );
}

function SimilarCard({ product }) {
  const { currencyPrefix } = useCountry();
  return (
    <Link
      to={`/produit/${product.id}`}
      className="group block rounded-2xl overflow-hidden bg-card border border-border/50 hover:shadow-md transition-all duration-300"
    >
      <div className="aspect-[3/4] bg-muted overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">👖</div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="text-sm font-medium line-clamp-2">{product.title}</p>
        {product.rating && (
          <div className="flex items-center gap-1">
            <StarRating rating={product.rating} />
            <span className="text-xs text-muted-foreground">{product.rating.toFixed(1)}</span>
          </div>
        )}
        {product.price != null && (
          <p className="text-sm font-semibold">{currencyPrefix}{product.price.toFixed(2)}</p>
        )}
      </div>
    </Link>
  );
}

export default function ProduitDetail() {
  const { id } = useParams();
  const { marketplace, currencyPrefix } = useCountry();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      setSimilar([]);

      const data = await fetchProductById(id, marketplace);

      if (!data || data.length === 0) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const p = data[0];
      setProduct(p);

      if (!p.is_active) {
        let sims = await fetchSimilar({ category: p.category, marketplace });
        if (!sims || sims.length === 0) {
          sims = await fetchSimilar({ marketplace });
        }
        setSimilar(sims.filter((s) => s.id !== p.id).slice(0, 4));
      }

      setLoading(false);
    };
    load();
  }, [id, marketplace]);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-16 bg-background/95 backdrop-blur-sm border-b border-border z-30 px-14 py-3">
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to catalogue</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-14 py-6">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="rounded-3xl overflow-hidden bg-muted aspect-[3/4]">
            {product.image_url ? (
              <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">👖</div>
            )}
          </div>

          <div className="flex flex-col gap-4 pt-2">
            {product.brand && (
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{product.brand}</p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{product.title}</h1>

            {product.rating && (
              <div className="flex items-center gap-2">
                <StarRating rating={product.rating} size="lg" />
                <span className="text-base font-semibold">{product.rating.toFixed(1)}</span>
                {product.ratings_count && (
                  <span className="text-sm text-muted-foreground">
                    ({product.ratings_count >= 1000
                      ? `${(product.ratings_count / 1000).toFixed(1)}k`
                      : product.ratings_count} reviews)
                  </span>
                )}
              </div>
            )}

            {product.price != null && (
              <p className="text-2xl font-bold text-foreground">
                {currencyPrefix}{product.price.toFixed(2)}
              </p>
            )}

            {product.best_seller_rank && (
              <p className="text-sm text-muted-foreground">
                🏆 Best Seller Rank: <span className="font-semibold text-foreground">#{product.best_seller_rank}</span>
              </p>
            )}

            {!product.is_active ? (
              <div className="mt-4 p-4 bg-muted rounded-2xl">
                <p className="text-sm font-medium text-muted-foreground text-center">
                  This product is no longer available.
                </p>
              </div>
            ) : (
              <div className="mt-auto pt-4">
                <a
                  href={product.affiliate_link}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="block w-full"
                >
                  <Button className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg shadow-primary/20 flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <svg viewBox="0 0 120 34" className="h-5 w-auto" fill="currentColor">
                      <path d="M34.1 12.3c0 1.3-.1 2.6-.3 3.8-.2 1.2-.4 2.3-.7 3.4l-.5 1.6c-.2.5-.3.9-.5 1.2l-.3.6c-.1.1-.1.2-.2.2-.2.2-.4.4-.7.5-.3.1-.5.2-.7.2-.4 0-.7-.1-.9-.3-.2-.2-.3-.5-.3-.9 0-.2 0-.4.1-.7.1-.3.1-.6.2-1 .1-.4.2-.8.2-1.3 0-.3 0-.7-.1-1.2-.1-.5-.4-.9-.7-1.2-.3-.3-.8-.5-1.4-.5-.6 0-1.2.1-1.8.4-.6.3-1.1.6-1.6 1.1-.5.5-.9 1-1.2 1.6-.3.6-.5 1.2-.5 1.9 0 .6.1 1.1.4 1.5.3.4.6.6 1.1.6.3 0 .5-.1.7-.2.2-.1.4-.3.5-.5l.3-.5c.1-.2.2-.4.3-.6.1-.2.3-.4.5-.5.2-.1.4-.2.7-.2.3 0 .6.1.8.2.2.1.4.3.5.5.1.2.2.5.2.8 0 .4-.2.8-.5 1.2-.3.4-.7.7-1.2 1-.5.3-1.1.5-1.8.6-.7.1-1.4.1-2.1-.1-.7-.2-1.4-.5-2-.9-.6-.4-1.1-.9-1.5-1.5-.4-.6-.6-1.4-.6-2.2 0-.6.1-1.2.3-1.8.2-.6.5-1.1.9-1.6.4-.5.8-.9 1.4-1.3.5-.4 1.1-.7 1.7-.9.6-.2 1.2-.4 1.8-.4.7 0 1.3.1 1.9.3.6.2 1.1.5 1.6.9.5.4.9.9 1.2 1.5.3.6.5 1.3.5 2.1zm-8.1 2.6c0-.4.1-.8.2-1.2.1-.4.3-.7.6-1 .3-.3.6-.5 1-.7.4-.2.8-.2 1.2-.2.6 0 1.1.2 1.5.5.4.3.6.8.6 1.3 0 .5-.1.9-.3 1.3-.2.4-.5.7-.9 1-.4.3-.8.5-1.3.5-.5 0-.9-.1-1.3-.4-.4-.3-.6-.7-.6-1.1h0z"/>
                    </svg>
                    View on Amazon
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Affiliate link — you will be redirected to the partner site
                </p>
              </div>
            )}
          </div>
        </div>

        {!product.is_active && similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-foreground mb-4">Available similar products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {similar.map((p) => (
                <SimilarCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}