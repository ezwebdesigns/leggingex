import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProductForm from '@/components/admin/ProductForm';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('b44_products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editProduct) {
        await supabase.from('b44_products').update(payload).eq('id', editProduct.id);
      } else {
        await supabase.from('b44_products').insert(payload);
      }
      setShowForm(false);
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await supabase.from('b44_products').delete().eq('id', id);
    fetchProducts();
  };

  const toggleStatus = async (product) => {
    await supabase.from('b44_products').update({
      status: product.status === 'active' ? 'archived' : 'active',
      updated_at: new Date().toISOString(),
    }).eq('id', product.id);
    fetchProducts();
  };

  const filtered = products.filter((p) =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const EMPTY_FORM = {
    name: '', brand: '', category: 'Women', image_url: '', price: '', rating: '', reviews_count: '',
    best_seller_rank: '', affiliate_url: '', affiliate_site: 'Amazon', description: '', material: '', status: 'active', is_featured: false,
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-foreground">Products ({products.length})</h2>
        <Button
          onClick={() => { setShowForm(true); setEditProduct(null); }}
          className="rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <div className="mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="max-w-sm rounded-xl"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <span className="text-4xl block mb-3">👖</span>
          <p className="font-medium">No products. Add one!</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Rating</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Rank</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : <span className="w-full h-full flex items-center justify-center text-lg">👖</span>}
                      </div>
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="px-2.5 py-1 bg-secondary text-foreground text-xs font-medium rounded-full">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 text-sm hidden md:table-cell">
                    {p.rating ? `${p.rating}★` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm hidden lg:table-cell">
                    {p.best_seller_rank ? `#${p.best_seller_rank}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${p.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {p.status === 'active' ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleStatus(p)}
                        title={p.status === 'active' ? 'Archive' : 'Activate'}
                        className="w-8 h-8 rounded-xl hover:bg-secondary flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {p.status === 'active' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => { setEditProduct(p); setShowForm(true); }}
                        className="w-8 h-8 rounded-xl hover:bg-secondary flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="w-8 h-8 rounded-xl hover:bg-destructive/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => { setShowForm(false); setEditProduct(null); }}
        >
          <div
            className="w-full max-w-2xl bg-background rounded-3xl border border-border shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-lg font-bold">{editProduct ? 'Edit Product' : 'New Product'}</h2>
              <button
                onClick={() => { setShowForm(false); setEditProduct(null); }}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <ProductForm
                initial={editProduct ? {
                  ...EMPTY_FORM,
                  ...editProduct,
                  price: editProduct.price?.toString() || '',
                  rating: editProduct.rating?.toString() || '',
                  reviews_count: editProduct.reviews_count?.toString() || '',
                  best_seller_rank: editProduct.best_seller_rank?.toString() || '',
                } : EMPTY_FORM}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditProduct(null); }}
                saving={saving}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
