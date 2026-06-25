import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Search, Heart } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: LayoutGrid, label: 'Catalogue', path: '/catalogue' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Heart, label: 'Favorites', path: '/favorites' },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 flex items-center justify-around px-2 py-2 safe-area-pb">
      {navItems.map(({ icon: Icon, label, path }) => {
        const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
        return (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
              active ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}