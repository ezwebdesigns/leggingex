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
          className={`w-3 h-3 ${i <= Math.round(rating) ? 'fill-yellow-400' : 'fill-gray-200'}`} 
        />
      ))}
    </span>
  );
}

export default function MiniProductCard({ product, featured = false }) {
  const { currencyPrefix } = useCountry();
  const { id, title, image_url, price, original_price, rating, ratings_count, brand, variant_images } = product;
  
  return (
    <Link
      to={`/produit/${id}`}
      className={`group flex flex-col w-full rounded-2xl overflow-hidden bg-card transition-all duration-300 ${
        featured ? 'h-full' : 'h-auto'
      }`}
    >
      {/* Conteneur de l'image de la carte */}
      <div 
        className={`w-full overflow-hidden bg-[#F5F5F5] relative rounded-2xl border border-border/50 ${
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
      
      {/* Zone de métadonnées - alignée précisément avec votre maquette */}
      <div className="pt-2 pb-1 px-1 space-y-0.5 shrink-0 bg-card">
        {brand && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary truncate leading-none">
            {brand}
          </p>
        )}
        <p className="text-xs font-bold text-foreground line-clamp-1 leading-tight">
          {title}
        </p>
        
        {rating && (
          <div className="flex items-center gap-1 leading-none">
            <Stars rating={rating} />
            {ratings_count && (
              <span className="text-[10px] font-medium text-muted-foreground">
                ({ratings_count >= 1000 ? `${(ratings_count / 1000).toFixed(1)}k` : ratings_count})
              </span>
            )}
          </div>
        )}
        
          {price != null && (
          <div className="flex items-baseline gap-1.5 pt-0.5 leading-none">
            <span className="text-xs font-bold text-foreground">
              {price.toFixed(2)} {currencyPrefix}
            </span>
            {original_price && original_price > price && (
              <span className="text-[10px] text-muted-foreground line-through">
                {original_price.toFixed(2)} {currencyPrefix}
              </span>
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