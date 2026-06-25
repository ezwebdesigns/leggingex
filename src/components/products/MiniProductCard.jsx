import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
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

export default function MiniProductCard({ product, compact, imageHeight }) {
  const { currencyPrefix } = useCountry();
  const { id, title, image_url, price, rating, ratings_count, brand } = product;
  return (
    <Link
      to={`/produit/${id}`}
      className={`group flex-shrink-0 block ${compact ? 'flex-1 min-w-0' : 'w-36 sm:w-44'}`}
    >
      <div className="rounded-2xl overflow-hidden bg-muted mb-2" style={imageHeight ? { height: imageHeight } : { aspectRatio: '3/4' }}>
        {image_url ? (
          <img
            src={image_url}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">👖</div>
        )}
      </div>
      {brand && <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground truncate">{brand}</p>}
      <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug mt-0.5">{title}</p>
      {rating && (
        <div className="flex items-center gap-1 mt-1">
          <Stars rating={rating} />
          <span className="text-xs text-muted-foreground">{rating.toFixed(1)}</span>
          {ratings_count && <span className="text-xs text-muted-foreground">({ratings_count >= 1000 ? `${(ratings_count / 1000).toFixed(1)}k` : ratings_count})</span>}
        </div>
      )}
      {price != null && (
        <p className="text-sm font-semibold text-foreground mt-0.5">{currencyPrefix}{price.toFixed(2)}</p>
      )}
    </Link>
  );
}