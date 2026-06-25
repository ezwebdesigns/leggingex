import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Upload, LogOut, ShoppingBag } from 'lucide-react';

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: Upload, label: 'Import CSV', path: '/admin/import' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-16 bg-sidebar border-r border-border z-40 items-center py-5 gap-1">
        <div className="mb-6 flex items-center justify-center w-10 h-10">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <ShoppingBag className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {adminNavItems.map(({ icon: Icon, label, path }) => {
            const active = path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(path);
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
          to="/"
          title="Back to site"
          className="flex flex-col items-center justify-center w-10 h-10 rounded-2xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.8} />
        </Link>
      </aside>

      <main className="flex-1 md:pl-16 min-h-screen flex flex-col">
        <div className="border-b border-border bg-background px-4 md:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground">Back-office</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to site
            </button>
            <span className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full font-medium">
              Admin
            </span>
          </div>
        </div>

        <div className="flex gap-1 px-4 md:px-8 pt-4 pb-2 border-b border-border">
          {adminNavItems.map(({ icon: Icon, label, path }) => {
            const active = path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex-1 px-4 md:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
