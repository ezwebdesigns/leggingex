import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Search, Heart, Settings, ShoppingBag } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: LayoutGrid, label: 'Catalogue', path: '/catalogue' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Heart, label: 'Favorites', path: '/favorites' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-16 bg-sidebar border-r border-border z-40 items-center py-5 gap-1">
      <Link to="/" className="mb-6 flex items-center justify-center w-10 h-10">
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
          <ShoppingBag className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
        </div>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              title={label}
              className={`
                flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 group
                ${active
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }
              `}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-primary' : ''}`} strokeWidth={active ? 2.5 : 1.8} />
            </Link>
          );
        })}
      </nav>

      <Link
        to="/admin"
        title="Admin"
        className={`
          flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 group
          ${location.pathname.startsWith('/admin')
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          }
        `}
      >
        <Settings className={`w-5 h-5 ${location.pathname.startsWith('/admin') ? 'text-primary' : ''}`} strokeWidth={1.8} />
      </Link>
    </aside>
  );
}