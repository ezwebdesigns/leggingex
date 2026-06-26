import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

import { useCountry } from '@/contexts/CountryContext';

function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star 
          key={i} 
          strokeWidth={0} 
          className={`w-2.5 h-2.5 ${i <= Math.round(rating) ? 'fill-yellow-400' : 'fill-gray-200'}`} 
        />
      ))}
    </span>
  );
}

export default function MiniProductCard({ product, featured = false }) {
  const { currencyPrefix } = useCountry();
  const { id, title, image_url, price, rating, ratings_count, brand } = product;
  
  return (
    <Link
      to={`/produit/${id}`}
      className={`group flex flex-col w-full rounded-xl border border-border overflow-hidden bg-card hover:shadow-md transition-all duration-300 ${
        featured ? 'h-full' : 'h-auto'
      }`}
    >
      {/* Conteneur de l'image : Flexible si "featured", carré fixe (aspect-square) sinon */}
      <div 
        className={`w-full overflow-hidden bg-muted relative ${
          featured ? 'flex-1 min-h-0' : 'aspect-square shrink-0'
        }`}
      >
        {image_url ? (
          <img
            src={image_url}
            alt={title}
            loading="lazy"
            className={`${
              featured ? 'absolute inset-0' : 'w-full h-full'
            } object-cover group-hover:scale-105 transition-transform duration-500`}
          />
        ) : (
          <div className={`${featured ? 'absolute inset-0' : 'w-full aspect-square'} flex items-center justify-center text-3xl`}>
            👖
          </div>
        )}
      </div>
      
      {/* Zone de métadonnées */}
      <div className="p-2 space-y-0.5 shrink-0 bg-card">
        {brand && (
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground truncate leading-none">
            {brand}
          </p>
        )}
        <p className="text-xs font-semibold text-foreground line-clamp-1 leading-tight">
          {title}
        </p>
        
        {rating && (
          <div className="flex items-center gap-1 leading-none">
            <Stars rating={rating} />
            <span className="text-[10px] text-muted-foreground">{rating.toFixed(1)}</span>
            {ratings_count && (
              <span className="text-[10px] text-muted-foreground">
                ({ratings_count >= 1000 ? `${(ratings_count / 1000).toFixed(1)}k` : ratings_count})
              </span>
            )}
          </div>
        )}
        
        {price != null && (
          <p className="text-xs font-bold text-foreground leading-none pt-0.5">
            {currencyPrefix}{price.toFixed(2)}
          </p>
        )}
      </div>
    </Link>
  );
}