import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSection } from '@/lib/supabaseApi';
import { useCountry } from '@/contexts/CountryContext';

export default function CategoryCircle({ label, value, imageUrl }) {
  const { marketplace } = useCountry();
  const [img, setImg] = useState(imageUrl || null);

  useEffect(() => {
    if (imageUrl) { setImg(imageUrl); return; }
    fetchSection(value, 1, marketplace)
      .then((data) => { if (data[0]?.image_url) setImg(data[0].image_url); })
      .catch(() => {});
  }, [value, marketplace, imageUrl]);

  return (
    <Link to={`/catalogue?category=${encodeURIComponent(value)}`} className="flex flex-col items-center gap-2 group">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-secondary border border-border/50 group-hover:ring-2 group-hover:ring-primary/30 transition-all">
        {img ? (
          <img src={img} alt={label} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-muted animate-pulse" />
        )}
      </div>
      <span className="text-xs text-center text-muted-foreground font-medium group-hover:text-foreground transition-colors leading-tight">{label}</span>
    </Link>
  );
}