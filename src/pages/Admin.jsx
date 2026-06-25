import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Upload, Pencil, Trash2, Archive, Eye, EyeOff, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const CATEGORIES = ['Women', 'Men', 'Kids', 'Sports', 'Plus Size', 'Fashion'];
const EMPTY_FORM = {
  name: '', brand: '', category: 'Women', image_url: '', price: '', rating: '', reviews_count: '',
  best_seller_rank: '', affiliate_url: '', affiliate_site: 'Amazon', description: '', material: '', status: 'active', is_featured: false,
};

function ProductForm({ initial = EMPTY_FORM, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      rating: form.rating ? parseFloat(form.rating) : null,
      reviews_count: form.reviews_count ? parseInt(form.reviews_count) : null,
      best_seller_rank: form.best_seller_rank ? parseInt(form.best_seller_rank) : null,
    };
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product Name *</Label>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} required className="mt-1 rounded-xl" placeholder="e.g. High Waisted Yoga Leggings" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Brand *</Label>
          <Input value={form.brand} onChange={(e) => set('brand', e.target.value)} required className="mt-1 rounded-xl" placeholder="e.g. Adidas, Nike..." />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category *</Label>
          <Select value={form.category} onValueChange={(v) => set('category', v)}>
            <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl">
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Image URL</Label>
          <Input value={form.image_url} onChange={(e) => set('image_url', e.target.value)} className="mt-1 rounded-xl" placeholder="https://..." type="url" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Indicative Price</Label>
          <Input value={form.price} onChange={(e) => set('price', e.target.value)} className="mt-1 rounded-xl" placeholder="29.99" type="number" step="0.01" min="0" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rating (0–5)</Label>
          <Input value={form.rating} onChange={(e) => set('rating', e.target.value)} className="mt-1 rounded-xl" placeholder="4.5" type="number" step="0.1" min="0" max="5" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reviews Count</Label>
          <Input value={form.reviews_count} onChange={(e) => set('reviews_count', e.target.value)} className="mt-1 rounded-xl" placeholder="1247" type="number" min="0" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Best Seller Rank</Label>
          <Input value={form.best_seller_rank} onChange={(e) => set('best_seller_rank', e.target.value)} className="mt-1 rounded-xl" placeholder="42" type="number" min="1" />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Affiliate Link *</Label>
          <Input value={form.affiliate_url} onChange={(e) => set('affiliate_url', e.target.value)} required className="mt-1 rounded-xl" placeholder="https://amazon.com/..." type="url" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Affiliate Site</Label>
          <Input value={form.affiliate_site} onChange={(e) => set('affiliate_site', e.target.value)} className="mt-1 rounded-xl" placeholder="Amazon" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Material</Label>
          <Input value={form.material} onChange={(e) => set('material', e.target.value)} className="mt-1 rounded-xl" placeholder="92% Polyester, 8% Spandex" />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</Label>
          <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} className="mt-1 rounded-xl resize-none" rows={3} placeholder="Product description..." />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</Label>
          <Select value={form.status} onValueChange={(v) => set('status', v)}>
            <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl">
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="flex-1 rounded-xl">
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

function CsvImport({ onImported }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const parseCSV = (text) => {
    const lines = text.split('\n').filter((l) => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
    return lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
      const obj = {};
      headers.forEach((h, i) => { obj[h] = values[i] || ''; });
      return obj;
    });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target.result);
      setPreview(rows.slice(0, 5));
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const file = fileRef.current?.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      setImporting(true);
      const rows = parseCSV(ev.target.result);
      let success = 0, errors = 0;
      for (const row of rows) {
        try {
          if (!row.name || !row.affiliate_url) { errors++; continue; }
          await supabase.from('b44_products').insert({
            name: row.name,
            brand: row.brand || '',
            category: CATEGORIES.includes(row.category) ? row.category : 'Women',
            image_url: row.image_url || '',
            price: row.price ? parseFloat(row.price) : null,
            rating: row.rating ? parseFloat(row.rating) : null,
            reviews_count: row.reviews_count ? parseInt(row.reviews_count) : null,
            best_seller_rank: row.best_seller_rank ? parseInt(row.best_seller_rank) : null,
            affiliate_url: row.affiliate_url,
            affiliate_site: row.affiliate_site || 'Amazon',
            description: row.description || '',
            material: row.material || '',
            status: 'active',
          });
          success++;
        } catch { errors++; }
      }
      setImporting(false);
      setPreview(null);
      setResult({ success, errors });
      if (fileRef.current) fileRef.current.value = '';
      onImported();
    };
    reader.readAsText(file);
  };

  return (
    <div className="border border-border rounded-2xl p-5 bg-muted/30">
      <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
        <Upload className="w-4 h-4 text-primary" />
        Bulk CSV Import
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Expected columns: name, brand, category, image_url, price, rating, reviews_count, best_seller_rank, affiliate_url, affiliate_site, description, material
      </p>

      <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" id="csv-input" />
      <label
        htmlFor="csv-input"
        className="inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-xl text-sm font-medium cursor-pointer hover:bg-muted transition-colors"
      >
        <Upload className="w-4 h-4" />
        Choose CSV file
      </label>

      {preview && (
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Preview (first 5 rows):</p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="text-xs w-full">
              <thead className="bg-muted">
                <tr>
                  {Object.keys(preview[0] || {}).slice(0, 6).map((k) => (
                    <th key={k} className="px-3 py-2 text-left font-medium text-muted-foreground">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    {Object.values(row).slice(0, 6).map((v, j) => (
                      <td key={j} className="px-3 py-2 text-foreground truncate max-w-[100px]">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={handleImport} disabled={importing} className="mt-3 rounded-xl" size="sm">
            {importing ? 'Importing...' : 'Confirm Import'}
          </Button>
        </div>
      )}

      {result && (
        <div className={`mt-3 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${result.errors === 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
          {result.errors === 0 ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {result.success} product{result.success !== 1 ? 's' : ''} imported
          {result.errors > 0 ? `, ${result.errors} error${result.errors !== 1 ? 's' : ''}` : ' successfully'}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('products');
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

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background px-4 md:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Back-office</h1>
          <p className="text-sm text-muted-foreground">{products.length} products total</p>
        </div>
        <Button
          onClick={() => { setShowForm(true); setEditProduct(null); }}
          className="rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <div className="flex gap-1 px-4 md:px-8 pt-4 pb-2">
        {['products', 'import'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
          >
            {t === 'products' ? 'Products' : 'CSV Import'}
          </button>
        ))}
      </div>

      <div className="px-4 md:px-8 pb-10">
        {tab === 'import' ? (
          <div className="max-w-2xl mt-4">
            <CsvImport onImported={fetchProducts} />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

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