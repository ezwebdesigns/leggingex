import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Upload, Home, FileText, LogOut, ShoppingBag, Settings, Mail, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: Upload, label: 'Import CSV', path: '/admin/import' },
  { icon: Home, label: 'Home', path: '/admin/home' },
  { icon: FileText, label: 'Pages', path: '/admin/pages' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
  { icon: Mail, label: 'Messages', path: '/admin/messages' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

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

        <Link to="/" title="Visit site" className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
          <ExternalLink className="w-5 h-5" strokeWidth={1.8} />
        </Link>

        <button
          onClick={handleLogout}
          title="Logout"
          className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.8} />
        </button>
      </aside>

      <main className="flex-1 md:pl-16 min-h-screen flex flex-col">
        <div className="border-b border-border bg-background px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Back-office</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full font-medium">
              Admin
            </span>
            <button
              onClick={handleLogout}
              className="md:hidden text-sm text-destructive hover:text-destructive/80 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex-1 px-4 md:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
