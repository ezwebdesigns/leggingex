import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import CategoryPills from '@/components/search/CategoryPills';
import ProductGrid from '@/components/products/ProductGrid';
import FilterPanel from '@/components/products/FilterPanel';
import SearchBar from '@/components/search/SearchBar';

export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);

  const [filters, setFilters] = useState({
    category: searchParams.get('cat') || '',
    brand: '',
    minRating: 0,
    sort: 'best_seller_rank',
  });

  useEffect(() => {
    const cat = searchParams.get('cat') || '';
    setFilters((f) => ({ ...f, category: cat }));
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q = supabase.from('b44_products').select('*').eq('status', 'active');
        if (filters.category) q = q.eq('category', filters.category);
        if (filters.brand) q = q.eq('brand', filters.brand);
        if (filters.minRating > 0) q = q.gte('rating', filters.minRating);

        const sortKey = filters.sort || 'best_seller_rank';
        q = q.order(sortKey, { ascending: true }).limit(200);
        const { data } = await q;

        const allBrands = [...new Set(data.map((p) => p.brand).filter(Boolean))].sort();
        setBrands(allBrands);
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  const handleCategorySelect = (cat) => {
    setFilters((f) => ({ ...f, category: cat }));
    if (cat) {
      setSearchParams({ cat });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-16 bg-background/95 backdrop-blur-sm border-b border-border z-30">
        <div className="px-4 lg:px-14 pt-4 pb-3 space-y-3">
          <SearchBar />
          <CategoryPills activeCategory={filters.category} onSelect={handleCategorySelect} />
          <FilterPanel filters={filters} onFiltersChange={setFilters} brands={brands} />
        </div>
      </div>

      <div className="px-4 lg:px-14 py-5">
        {!loading && (
          <p className="text-sm text-muted-foreground mb-4 font-medium">
            {products.length} legging{products.length !== 1 ? 's' : ''} found
            {filters.category ? ` in "${filters.category}"` : ''}
          </p>
        )}
        <ProductGrid
          products={products}
          loading={loading}
          emptyMessage={`No leggings found${filters.category ? ` in "${filters.category}"` : ''}`}
        />
      </div>
    </div>
  );
}