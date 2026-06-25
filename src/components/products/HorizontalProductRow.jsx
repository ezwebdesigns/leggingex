import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function HorizontalProductRow({ title, products, categoryPath }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4 px-4 md:px-6">
        <Link
          to={categoryPath || '/categories'}
          className="flex items-center gap-1 group"
        >
          <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h2>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      </div>

      <div className="px-4 md:px-6">
        {/* 2x2 grid or horizontal scroll on mobile */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-3">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="flex sm:hidden gap-3 overflow-x-auto scrollbar-hide pb-2">
          {products.slice(0, 8).map((product) => (
            <div key={product.id} className="w-40 flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}