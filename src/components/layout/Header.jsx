import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import CountryToggle from './CountryToggle';
import { getSettings } from '@/lib/settings';

export default function Header() {
  const [general, setGeneral] = useState(null);

  useEffect(() => {
    getSettings().then((s) => setGeneral(s.general || null)).catch(() => {});
  }, []);

  const logo = general?.logo;
  const siteTitle = general?.site_title || 'leggings';

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 lg:px-14 py-3">
        <Link to="/" className="flex items-center gap-2">
          {logo ? (
            <img src={logo} alt={siteTitle} className="h-7 w-auto" />
          ) : (
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2} />
            </div>
          )}
          {!logo && <span className="text-base sm:text-lg font-bold tracking-tight text-foreground">{siteTitle}</span>}
        </Link>
        <CountryToggle />
      </div>
    </header>
  );
}