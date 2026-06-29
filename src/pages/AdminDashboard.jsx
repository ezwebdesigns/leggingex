import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Package, Upload, LayoutDashboard, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      const { count: productCount } = await supabase.from('b44_products').select('*', { count: 'exact', head: true });
      const { count: activeCount } = await supabase.from('b44_products').select('*', { count: 'exact', head: true }).eq('status', 'active');
      const { count: unreadCount } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('read', false);
      setStats({ productCount, activeCount, unreadCount });
    }
    loadStats();
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats ? stats.productCount : '...'}</p>
          <p className="text-sm text-muted-foreground">Total products</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats ? stats.activeCount : '...'}</p>
          <p className="text-sm text-muted-foreground">Active products</p>
        </div>

        <Link to="/admin/messages" className="bg-card border border-border rounded-2xl p-5 hover:bg-muted/50 transition-colors block">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-foreground">Messages</p>
          <p className="text-sm text-muted-foreground">{stats ? `${stats.unreadCount} unread` : '...'}</p>
        </Link>
        <Link to="/admin/import" className="bg-card border border-border rounded-2xl p-5 hover:bg-muted/50 transition-colors block">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Upload className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-foreground">Import products</p>
          <p className="text-sm text-muted-foreground">Bulk CSV import</p>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 mt-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">More</h3>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/messages" className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl text-sm font-medium hover:bg-muted transition-colors">
            <Mail className="w-4 h-4" />
            Messages
          </Link>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-2">Quick links</h3>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/products" className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl text-sm font-medium hover:bg-muted transition-colors">
            <Package className="w-4 h-4" />
            Manage Products
          </Link>
          <Link to="/admin/import" className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl text-sm font-medium hover:bg-muted transition-colors">
            <Upload className="w-4 h-4" />
            CSV Import
          </Link>
        </div>
      </div>
    </div>
  );
}
