import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useCountry } from '@/contexts/CountryContext';

function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 fill-gray-200'}`}
          strokeWidth={0}
        />
      ))}
    </span>
  );
}

export default function ProductCard({ product }) {
  const { currencyPrefix } = useCountry();
  const { id, title, brand, rating, ratings_count, image_url, price } = product;

  return (
    <Link
      to={`/produit/${id}`}
      className="group block rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-border hover:shadow-md transition-all duration-300 animate-fade-in"
    >
      <div className="relative aspect-[1/1] overflow-hidden bg-muted">
        {image_url ? (
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <span className="text-4xl">👖</span>
          </div>
        )}
      </div>

      <div className="p-2 space-y-0.5">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{brand}</p>
        <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{title}</h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {rating ? (
              <>
                <StarRating rating={rating} />
                {ratings_count && (
                  <span className="text-[11px] text-muted-foreground">
                    ({ratings_count >= 1000 ? `${(ratings_count / 1000).toFixed(1)}k` : ratings_count})
                  </span>
                )}
              </>
            ) : (
              <span className="text-[11px] text-muted-foreground">Not rated yet</span>
            )}
          </div>
          {price && (
            <span className="text-sm font-semibold text-foreground">{currencyPrefix}{price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
