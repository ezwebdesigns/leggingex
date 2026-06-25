import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProductGrid from '@/components/products/ProductGrid';
import { supabase } from '@/lib/supabaseClient';

export default function Favorites() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const ids = JSON.parse(localStorage.getItem('leggings_favorites') || '[]');
        if (ids.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }
        const { data: all } = await supabase
          .from('b44_products')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(500);
        setProducts((all || []).filter((p) => ids.includes(p.id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 md:px-6 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-5 h-5 text-primary fill-primary" />
          <h1 className="text-xl font-bold text-foreground">My Favorites</h1>
        </div>
        {!loading && (
          <p className="text-sm text-muted-foreground">
            {products.length} saved product{products.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="px-4 md:px-6 pb-8">
        {!loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Heart className="w-7 h-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">No favorites yet</h2>
            <p className="text-sm text-muted-foreground max-w-xs mb-5">
              Add leggings to your favorites to easily find them here later.
            </p>
            <Link
              to="/categories"
              className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Discover leggings
            </Link>
          </div>
        ) : (
          <ProductGrid products={products} loading={loading} />
        )}
      </div>
    </div>
  );
}