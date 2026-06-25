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
  const { id, name, brand, rating, reviews_count, best_seller_rank, image_url, price, category } = product;

  return (
    <Link
      to={`/product/${id}`}
      className="group block rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-border hover:shadow-md transition-all duration-300 animate-fade-in"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <span className="text-4xl">👖</span>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {best_seller_rank && best_seller_rank <= 10 && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full shadow-sm">
              #1 Best Seller
            </span>
          )}
          {best_seller_rank && best_seller_rank <= 100 && best_seller_rank > 10 && (
            <span className="px-2 py-0.5 bg-foreground/80 text-background text-[10px] font-semibold rounded-full shadow-sm">
              Top 100
            </span>
          )}
        </div>

        {category && (
          <div className="absolute top-2.5 right-2.5">
            <span className="px-2 py-0.5 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-medium rounded-full">
              {category}
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">{brand}</p>
        <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-2">{name}</h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {rating ? (
              <>
                <StarRating rating={rating} />
                {reviews_count && (
                  <span className="text-[11px] text-muted-foreground">
                    ({reviews_count >= 1000 ? `${(reviews_count / 1000).toFixed(1)}k` : reviews_count})
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

        {best_seller_rank && (
          <p className="text-[10px] text-muted-foreground mt-1.5">Rank #{best_seller_rank}</p>
        )}
      </div>
    </Link>
  );
}