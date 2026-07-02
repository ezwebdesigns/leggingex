import { useState, useEffect } from 'react';
import { Link, useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { Star, Loader2, SlidersHorizontal, X, ChevronDown, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchCatalog, fetchFilterOptions } from '@/lib/supabaseApi';
import { useCountry } from '@/contexts/CountryContext';
import { supabase } from '@/lib/supabaseClient';
import { SLUG_TO_CATEGORY, CATEGORY_SLUGS } from '@/lib/categorySlugs';
import ScrollableRow from '@/components/ui/ScrollableRow';
import FaqAccordion from '@/components/home/FaqAccordion';
import { usePageMeta } from '@/hooks/usePageMeta';

const SORT_OPTIONS = [
  { label: 'Top Rated', value: 'rating.desc.nullslast,ratings_count.desc.nullslast' },
  { label: 'Most Reviews', value: 'ratings_count.desc.nullslast' },
  { label: 'Price: Low to High', value: 'price.asc.nullslast' },
  { label: 'Price: High to Low', value: 'price.desc.nullslast' },
  { label: 'Best Seller', value: 'best_seller_rank.asc.nullslast' },
];

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
  const { id, title, image_url, price, original_price, rating, ratings_count, brand, variant_images } = product;
  const [fav, setFav] = useState(false);

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('leggings_favorites') || '[]');
      setFav(favs.includes(id));
    } catch { /* ignore */ }
  }, [id]);

  const toggleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const favs = JSON.parse(localStorage.getItem('leggings_favorites') || '[]');
      const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
      localStorage.setItem('leggings_favorites', JSON.stringify(next));
      setFav(!fav);
    } catch { /* ignore */ }
  };

  return (
    <Link to={`/produit/${id}`} className="group flex flex-col w-full rounded-2xl overflow-hidden bg-card transition-all duration-300">
      <div className="w-full aspect-square overflow-hidden bg-[#F5F5F5] relative rounded-2xl border border-border/50">
        {image_url ? (
          <img src={image_url} alt={title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">👖</div>
        )}
        <button
          onClick={toggleFav}
          className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
        >
          <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
        </button>
      </div>
      <div className="pt-2 pb-1 px-1 space-y-0.5 bg-card">
        {brand && <p className="text-[10px] font-semibold uppercase tracking-wider text-primary truncate leading-none">{brand}</p>}
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
        {variant_images?.length > 1 && (
          <div className="flex items-center gap-1 pt-1 leading-none">
            {variant_images.slice(0, 4).map((url, i) => (
              <div key={i} className="w-5 h-5 rounded-full overflow-hidden border border-border/30 flex-shrink-0">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

const PAGE_SIZE = 24;

export default function Catalogue() {
  const { marketplace } = useCountry();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const slugCategory = SLUG_TO_CATEGORY[categorySlug] || '';

  const [products, setProducts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [brands, setBrands] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [pageData, setPageData] = useState(null);
  const [categoryContent, setCategoryContent] = useState(null);
  const [categoryFaq, setCategoryFaq] = useState([]);
  const [descExpanded, setDescExpanded] = useState(false);

  const DEFAULT_SORT = 'rating.desc.nullslast,ratings_count.desc.nullslast';

  const [filters, setFilters] = useState({
    category: slugCategory || searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minRating: parseFloat(searchParams.get('minRating') || '0'),
    sort: searchParams.get('sort') || DEFAULT_SORT,
    search: searchParams.get('search') || '',
  });

  useEffect(() => {
    supabase.from('category_tags').select('*').eq('is_active', true).order('sort_order').limit(50)
      .then(({ data }) => setSubcategories(data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchFilterOptions(marketplace).then(({ brands }) => setBrands(brands)).catch(() => {});
  }, [marketplace]);

  useEffect(() => {
    const newFilters = {
      category: slugCategory || searchParams.get('category') || '',
      brand: searchParams.get('brand') || '',
      minRating: parseFloat(searchParams.get('minRating') || '0'),
      sort: searchParams.get('sort') || DEFAULT_SORT,
      search: searchParams.get('search') || '',
    };
    setFilters(newFilters);
  }, [searchParams.toString(), categorySlug]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setOffset(0);
      const data = await fetchCatalog({ ...filters, offset: 0, marketplace });
      setProducts(data);
      setHasMore(data.length === PAGE_SIZE);
      setOffset(PAGE_SIZE);
      setLoading(false);
    };
    load();
  }, [filters.category, filters.brand, filters.minRating, filters.sort, filters.search, marketplace]);

  const loadMore = async () => {
    setLoadingMore(true);
    const data = await fetchCatalog({ ...filters, offset, marketplace });
    setProducts((prev) => [...prev, ...data]);
    setHasMore(data.length === PAGE_SIZE);
    setOffset((o) => o + PAGE_SIZE);
    setLoadingMore(false);
  };

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (key === 'category') {
      const params = {};
      if (next.brand) params.brand = next.brand;
      if (next.minRating > 0) params.minRating = next.minRating;
      if (next.sort !== DEFAULT_SORT) params.sort = next.sort;
      if (next.search) params.search = next.search;
      if (value) {
        const slug = CATEGORY_SLUGS[value];
        if (slug) {
          const qs = Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '';
          navigate(`/catalogue/${slug}${qs}`, { replace: true });
          return;
        }
      }
      navigate(`/catalogue${Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : ''}`, { replace: true });
      return;
    }
    const params = {};
    if (next.category) params.category = next.category;
    if (next.brand) params.brand = next.brand;
    if (next.minRating > 0) params.minRating = next.minRating;
    if (next.sort !== DEFAULT_SORT) params.sort = next.sort;
    if (next.search) params.search = next.search;
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ category: '', brand: '', minRating: 0, sort: DEFAULT_SORT, search: '' });
    navigate('/catalogue', { replace: true });
  };

  const activeFilterCount = [filters.category, filters.brand, filters.minRating > 0].filter(Boolean).length;

  useEffect(() => {
    if (filters.category) {
      supabase.from('catalogue_pages').select('*').eq('value', filters.category).eq('is_active', true).maybeSingle()
        .then(({ data }) => setPageData(data || null))
        .catch(() => setPageData(null));
    } else {
      supabase.from('catalogue_pages').select('*').eq('is_active', true).order('sort_order').limit(1).maybeSingle()
        .then(({ data }) => setPageData(data || null))
        .catch(() => setPageData(null));
    }
  }, [filters.category]);

  useEffect(() => {
    if (!filters.category) { setCategoryFaq([]); return; }
    supabase.from('home_categories')
      .select('faq_schema')
      .eq('value', filters.category)
      .maybeSingle()
      .then(({ data }) => setCategoryFaq(data?.faq_schema || []))
      .catch(() => setCategoryFaq([]));
  }, [filters.category]);

  useEffect(() => {
    if (!categorySlug) { setCategoryContent(null); return; }
    supabase.from('category_content').select('*').eq('slug', categorySlug).maybeSingle()
      .then(({ data }) => setCategoryContent(data || null))
      .catch(() => setCategoryContent(null));
  }, [categorySlug]);

  const faqItems = categoryFaq;

  const categoryName = pageData?.label || slugCategory;
  const rawDesc = categoryContent?.intro_html
    ? categoryContent.intro_html.replace(/<[^>]*>/g, '')
    : undefined;
  usePageMeta({
    title: categoryName ? `${categoryName} — Shop the best picks | Legging Express` : undefined,
    description: rawDesc,
    ogImage: categoryContent?.intro_html ? 'https://www.leggingexpress.com/og-default.jpg' : undefined,
    canonical: categorySlug ? `/catalogue/${categorySlug}` : '/catalogue',
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <ScrollableRow alwaysShowArrows className="px-4 lg:px-14 pt-2 pb-2">
          <button
            onClick={() => updateFilter('category', '')}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${!filters.category ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border/50 text-foreground hover:bg-muted'}`}
          >
            All
          </button>
          {subcategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.value)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${filters.category === cat.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border/50 text-foreground hover:bg-muted'}`}
            >
              {cat.label}
            </button>
          ))}
        </ScrollableRow>

        <div className="flex items-center gap-2 px-4 lg:px-14 pb-3">
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="appearance-none pl-3 pr-8 h-8 rounded-xl text-xs font-medium bg-background border border-border text-foreground outline-none cursor-pointer hover:border-primary/50 transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          <button
            onClick={() => setShowFilters(true)}
            className={`flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium border transition-all ${activeFilterCount > 0 ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-foreground hover:border-primary/50'}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-primary-foreground text-primary w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}

          <div className="ml-auto text-xs text-muted-foreground font-medium hidden sm:block">
            {!loading && `${products.length}+ results`}
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-14 py-5">
        {(filters.category || pageData) && (() => {
          const displayLabel = pageData?.label || filters.category;
          const displayDesc = pageData?.description || (filters.category ? subcategories.find(t => t.value === filters.category)?.description : '');
          return (
            <div className="mb-6">
              <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                <Link to="/catalogue" className="hover:text-foreground transition-colors">All categories</Link>
                {filters.category && <><span className="text-border">/</span><span className="text-foreground font-medium">{displayLabel}</span></>}
              </nav>
              <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground whitespace-nowrap">{displayLabel}</h1>
                {displayDesc && (() => {
                  const words = displayDesc.split(/\s+/);
                  const isLong = words.length > 50;
                  const shown = isLong && !descExpanded ? words.slice(0, 50) : words;
                  return (
                    <>
                      <div className="hidden md:block w-px h-8 bg-border self-center" />
                      <div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {shown.join(' ')}
                          {isLong && !descExpanded && (
                            <button
                              onClick={() => setDescExpanded(true)}
                              className="text-xs text-primary hover:underline font-medium ml-1"
                            >
                              ... See more
                            </button>
                          )}
                        </p>
                        {isLong && descExpanded && (
                          <button
                            onClick={() => setDescExpanded(false)}
                            className="text-xs text-primary hover:underline font-medium mt-1"
                          >
                            See less
                          </button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          );
        })()}
        {filters.search && (
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">"{filters.search}"</h1>
            <p className="text-sm text-muted-foreground mt-1">Search results</p>
          </div>
        )}

        {(filters.category || filters.search) && (
          <div className="border-t border-border my-6" />
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-3 md:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[1/1] bg-muted rounded-2xl border border-border/50" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">👖</span>
            <p className="text-lg font-medium text-muted-foreground">No products found</p>
            <button onClick={clearFilters} className="mt-4 text-sm text-primary hover:underline">Reset filters</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-3 md:gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button onClick={loadMore} disabled={loadingMore} variant="outline" className="rounded-xl px-8">
                  {loadingMore ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</> : 'Load more'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowFilters(false)}>
          <div className="w-full max-w-md bg-background rounded-t-3xl md:rounded-2xl border border-border shadow-xl p-6 animate-fade-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            {brands.length > 0 && (
              <div className="mb-5">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 block">Brand</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => updateFilter('brand', '')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!filters.brand ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-muted'}`}>All</button>
                  {brands.slice(0, 20).map((b) => (
                    <button key={b} onClick={() => updateFilter('brand', b)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filters.brand === b ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-muted'}`}>{b}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 block">Minimum Rating</label>
              <div className="flex gap-2">
                {[0, 3, 3.5, 4, 4.5].map((r) => (
                  <button key={r} onClick={() => updateFilter('minRating', r)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filters.minRating === r ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-muted'}`}>
                    {r === 0 ? 'All' : `${r}★+`}
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full rounded-xl" onClick={() => setShowFilters(false)}>
              Apply
            </Button>
          </div>
        </div>
      )}

      {faqItems.length > 0 && (
        <div className="mt-12">
          <FaqAccordion columns={faqItems} />
        </div>
      )}
    </div>
  );
}