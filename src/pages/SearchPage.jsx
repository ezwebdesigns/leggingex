import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowRight, Star } from 'lucide-react';
import { fetchCatalog } from '@/lib/supabaseApi';
import { useCountry } from '@/contexts/CountryContext';

function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} strokeWidth={0} className={`w-3 h-3 ${i <= Math.round(rating) ? 'fill-yellow-400' : 'fill-gray-200'}`} />
      ))}
    </span>
  );
}

function ProductCard({ product }) {
  const { currencyPrefix } = useCountry();
  const { id, title, image_url, price, original_price, rating, ratings_count, brand } = product;
  return (
    <Link to={`/produit/${id}`} className="group flex flex-col w-full rounded-2xl overflow-hidden bg-card transition-all duration-300">
      <div className="w-full aspect-square overflow-hidden bg-[#F5F5F5] relative rounded-2xl border border-border/50">
        {image_url ? (
          <img src={image_url} alt={title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">👖</div>
        )}
      </div>
      <div className="pt-2 pb-1 px-1 space-y-0.5 bg-card">
        {brand && <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate leading-none">{brand}</p>}
        <p className="text-xs font-bold text-foreground line-clamp-1 leading-tight">{title}</p>
        {rating && (
          <div className="flex items-center gap-1 leading-none">
            <Stars rating={rating} />
            <span className="text-[10px] font-medium text-muted-foreground">{rating.toFixed(1)}</span>
            {ratings_count && <span className="text-[10px] font-medium text-muted-foreground">({ratings_count >= 1000 ? `${(ratings_count / 1000).toFixed(1)}k` : ratings_count})</span>}
          </div>
        )}
        {price != null && (
          <div className="flex items-baseline gap-1.5 pt-0.5 leading-none">
            <span className="text-xs font-bold text-foreground">{price.toFixed(2)} {currencyPrefix}</span>
            {original_price && original_price > price && (
              <span className="text-[10px] text-muted-foreground line-through">{original_price.toFixed(2)} {currencyPrefix}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const { marketplace } = useCountry();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentQ = searchParams.get('q') || '';

  useEffect(() => {
    setQuery(currentQ);
    if (!currentQ) { setProducts([]); return; }
    setLoading(true);
    fetchCatalog({ search: currentQ, limit: 60, marketplace })
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [currentQ, marketplace]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) setSearchParams({ q: query.trim() });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 md:px-6 py-3">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-secondary rounded-xl px-3 sm:px-4 py-2.5 border border-border focus-within:border-primary/40 focus-within:bg-background transition-all">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.8} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leggings..."
              autoFocus
              className="flex-1 min-w-0 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
            />
            {query && (
              <button type="submit" className="flex-shrink-0 w-7 h-7 bg-primary text-primary-foreground rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity">
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="px-4 md:px-6 py-5">
        {!currentQ ? (
          <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-3xl">🔍</div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Search for leggings</h2>
            <p className="text-sm text-muted-foreground">Type a name, brand, or style…</p>
          </div>
        ) : (
          <>
            {!loading && (
              <p className="text-sm text-muted-foreground mb-4 font-medium">
                {products.length} result{products.length !== 1 ? 's' : ''} for <span className="text-foreground font-semibold">"{currentQ}"</span>
              </p>
            )}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-[1/1] bg-muted rounded-2xl border border-border/50" />
                    <div className="p-3 space-y-2"><div className="h-3 bg-muted rounded w-3/4" /><div className="h-3 bg-muted rounded w-1/2" /></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="text-5xl mb-4">😕</span>
                <p className="text-lg font-medium text-foreground">No results for "{currentQ}"</p>
                <p className="text-sm text-muted-foreground mt-1">Try a broader search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}