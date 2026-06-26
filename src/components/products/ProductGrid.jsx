import ProductCard from './ProductCard';

export default function ProductGrid({ products, loading, emptyMessage = "No products found" }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-muted animate-pulse">
            <div className="aspect-[1/1] bg-muted rounded-2xl border border-border/50" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">👖</span>
        <p className="text-muted-foreground text-lg font-medium">{emptyMessage}</p>
        <p className="text-muted-foreground text-sm mt-1">Try broadening your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}