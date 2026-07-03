import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import ImageUploader from '@/components/admin/ImageUploader';

const SECTION_TYPES = [
  { value: 'products', label: 'Product Carousel' },
  { value: 'featured', label: 'Featured Section' },
  { value: 'cta_cards', label: 'CTA Cards' },
  { value: 'editorial', label: 'Editorial Row' },
  { value: 'ad_banner', label: 'Ad Banner' },
  { value: 'articles', label: 'Recent Articles' },
];

const AD_DISPLAY_TYPES = [
  { value: 'full', label: 'Full Banner Ad' },
  { value: 'simple', label: 'Simple Banner Ad' },
  { value: 'square', label: 'Square Ad' },
];

const FEATURED_FORMAT_TYPES = [
  { value: 'product', label: 'Product' },
  { value: 'banner', label: 'Banner' },
  { value: 'text', label: 'Text' },
];

const PAGE_TYPES = [
  { value: 'static_page', label: 'Static Page' },
  { value: 'blog_post', label: 'Blog Post' },
];

const homeTabs = [
  { id: 'hero_banners', label: 'Hero Banners', table: 'hero_banners' },
  { id: 'home_sections', label: 'Sections', table: 'home_sections' },
  { id: 'category_tags', label: 'Tags', table: 'category_tags' },
  { id: 'home_categories', label: 'Categories', table: 'home_categories' },
  { id: 'cta_cards', label: 'CTA Cards', table: 'cta_cards' },
  { id: 'editorial_cards', label: 'Editorial', table: 'editorial_cards' },
  { id: 'ad_banners', label: 'Ad Banners', table: 'ad_banners' },
  { id: 'catalogue_pages', label: 'Catalogue Page', table: 'catalogue_pages' },
  { id: 'featured_sections', label: 'Featured Sections', table: 'featured_sections' },
];

function EntityForm({ entity, fields, initial, onSave, onCancel, saving, imageFolder }) {
  const [form, setForm] = useState(initial);
  const [dynamicOptions, setDynamicOptions] = useState({});
  const loadedRef = useRef(new Set());
  const lastDeps = useRef({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleSelected = (key, id) => {
    const current = form[key] || [];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    set(key, next);
  };

  useEffect(() => {
    fields.forEach(async (f) => {
      if (typeof f.options === 'function') {
        if (!f.condition || (form[f.condition.field] === f.condition.value)) {
          if (f.deps) {
            const depsKey = f.deps.map((d) => `${d}:${form[d] ?? ''}`).join('|');
            if (depsKey !== lastDeps.current[f.key]) {
              lastDeps.current[f.key] = depsKey;
              loadedRef.current.delete(f.key);
            }
          }
          if (loadedRef.current.has(f.key)) return;
          loadedRef.current.add(f.key);
          const opts = await f.options(form);
          setDynamicOptions((prev) => ({ ...prev, [f.key]: opts }));
        }
      }
    });
  }, [fields, form]);

  const prevAdType = useRef(form.ad_display_type);
  useEffect(() => {
    if (form.ad_display_type && form.ad_display_type !== prevAdType.current) {
      prevAdType.current = form.ad_display_type;
      setForm((f) => ({ ...f, selected_ids: [] }));
    }
  }, [form.ad_display_type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    fields.forEach((f) => {
      if (f.type === 'number' && payload[f.key]) payload[f.key] = parseFloat(payload[f.key]);
    });
    onSave(payload);
  };

  const hasSidebar = fields.some(f => f.sidebar);
  const renderField = (f, inSidebar) => {
    if (f.condition && form[f.condition.field] !== f.condition.value) return null;
    const options = typeof f.options === 'function' ? (dynamicOptions[f.key] || []) : (f.options || []);
    const colSpan = hasSidebar && inSidebar ? '' : (f.fullWidth ? 'sm:col-span-2' : '');
    return (
      <div key={f.key} className={colSpan}>
        {f.type === 'image' ? (
          <ImageUploader
            value={form[f.key] || ''}
            onChange={(url) => set(f.key, url)}
            folder={imageFolder || 'general'}
            label={f.label}
          />
        ) : f.type === 'multi-select' ? (
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
              {f.label} {f.required ? '*' : ''}
            </Label>
            {(!options || options.length === 0) ? (
              <p className="text-sm text-muted-foreground">No items available. Create them first in the {f.label} tab.</p>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto border border-border rounded-xl p-2">
                {options.map((opt) => {
                  const checked = (form[f.key] || []).includes(opt.value);
                  return (
                    <label key={opt.value}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        checked ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted border border-transparent'
                      }`}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggleSelected(f.key, opt.value)} className="rounded accent-primary" />
                      {opt.image && <img src={opt.image} alt="" className="w-8 h-8 rounded object-cover border border-border/50" />}
                      <span className="text-sm font-medium text-foreground">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ) : f.type === 'faq_columns' ? (
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">
              FAQ ({f.label})
            </Label>
            <FaqColumnsEditor value={form[f.key] || []} onChange={(v) => set(f.key, v)} />
          </div>
        ) : (
          <>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {f.label} {f.required ? '*' : ''}
            </Label>
            {f.type === 'textarea' ? (
              <Textarea value={form[f.key] || ''} onChange={(e) => set(f.key, e.target.value)}
                className="mt-1 rounded-xl resize-none" rows={f.rows || 3} required={f.required} placeholder={f.placeholder} />
            ) : f.type === 'select' ? (
              <Select value={form[f.key] || ''} onValueChange={(v) => set(f.key, v)}>
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {options.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                </SelectContent>
              </Select>
            ) : f.type === 'switch' ? (
              <div className="mt-2">
                <Switch checked={form[f.key]} onCheckedChange={(v) => set(f.key, v)} />
              </div>
            ) : f.type === 'number' ? (
              <Input value={form[f.key] || ''} onChange={(e) => set(f.key, e.target.value)}
                className="mt-1 rounded-xl" type="number" step="0.01" placeholder={f.placeholder} />
            ) : (
              <Input value={form[f.key] || ''} onChange={(e) => set(f.key, e.target.value)}
                className="mt-1 rounded-xl" required={f.required} placeholder={f.placeholder}
                type={f.type === 'url' ? 'url' : 'text'} />
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {hasSidebar ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.filter(f => !f.sidebar).map((f) => renderField(f, false))}
            </div>
          </div>
          <div className="space-y-4">
            {fields.filter(f => f.sidebar).map((f) => renderField(f, true))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((f) => renderField(f, false))}
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl">Cancel</Button>
        <Button type="submit" disabled={saving} className="flex-1 rounded-xl">
          {saving ? 'Saving...' : (entity ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
}

function EntityManager({ table, fields, defaultForm, labelSingular }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from(table).select('*').order('sort_order', { ascending: true }).limit(500);
      setItems(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [table]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSave = async (payload) => {
    setSaving(true);
    setError(null);
    try {
      if (payload.featured_section_id === '') payload.featured_section_id = null;
      if (payload.featured_section_id_2 === '') payload.featured_section_id_2 = null;
      if (editItem) {
        const { error: err } = await supabase.from(table).update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editItem.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from(table).insert(payload);
        if (err) throw err;
      }
      setShowForm(false);
      setEditItem(null);
      fetchItems();
    } catch (err) {
      setError(err.message);
    }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete this ${labelSingular}?`)) return;
    setError(null);
    const { error: err } = await supabase.from(table).delete().eq('id', id);
    if (err) setError(err.message);
    fetchItems();
  };

  const toggleActive = async (item) => {
    setError(null);
    const { error: err } = await supabase.from(table).update({ is_active: !item.is_active, updated_at: new Date().toISOString() }).eq('id', item.id);
    if (err) setError(err.message);
    fetchItems();
  };

  const filtered = items.filter((item) => {
    if (!search) return true;
    const searchable = [item.title, item.label, item.name, item.slug, item.value].filter(Boolean);
    return searchable.some((s) => s.toLowerCase().includes(search.toLowerCase()));
  });

  const getName = (item) => item.title || item.label || item.name || item.slug || item.id?.slice(0, 8);
  const getPreview = (item) => item.image_url || item.cover_image;

  return (
    <div>
      {showForm ? (
        <div>
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground">{editItem ? `Edit ${labelSingular}` : `New ${labelSingular}`}</h2>
            <Button variant="ghost" onClick={() => { setShowForm(false); setEditItem(null); setError(null); }} className="rounded-xl">
              ← Back to list
            </Button>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl">
              {error}
            </div>
          )}
          <EntityForm
            entity={editItem}
            fields={fields}
            initial={editItem || defaultForm}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditItem(null); setError(null); }}
            saving={saving}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-foreground">{labelSingular}s ({items.length})</h2>
            <Button onClick={() => { setShowForm(true); setEditItem(null); }} className="rounded-xl flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add {labelSingular}
            </Button>
          </div>
          <div className="mb-4">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${labelSingular.toLowerCase()}s...`} className="max-w-sm rounded-xl" />
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-14 bg-muted rounded-2xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <span className="text-4xl block mb-3">📄</span>
              <p className="font-medium">No {labelSingular.toLowerCase()}s yet.</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl">
                  {error}
                </div>
              )}
            <div className="rounded-2xl border border-border overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide w-8"><GripVertical className="w-3 h-3" /></th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Order</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Active</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground"><GripVertical className="w-3.5 h-3.5" /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {getPreview(item) ? (
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img src={getPreview(item)} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : <div className="w-9 h-9 rounded-lg bg-muted flex-shrink-0" />}
                          <span className="font-medium text-foreground line-clamp-1">{getName(item)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{item.sort_order ?? '-'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(item)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${item.is_active ? 'bg-green-50 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                          {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditItem(item); setShowForm(true); }} className="w-8 h-8 rounded-xl hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-xl hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function FaqColumnsEditor({ value, onChange }) {
  const faq = Array.isArray(value) ? value : [];
  const updateColumn = (ci, items) => {
    const next = [...faq];
    next[ci] = { ...next[ci], items };
    onChange(next);
  };
  const removeColumn = (ci) => onChange(faq.filter((_, i) => i !== ci));
  const addColumn = () => {
    if (faq.length >= 2) return;
    onChange([...faq, { title: '', items: [{ q: '', a: '' }] }]);
  };
  const addItem = (ci) => updateColumn(ci, [...(faq[ci]?.items || []), { q: '', a: '' }]);
  const removeItem = (ci, ii) => updateColumn(ci, faq[ci].items.filter((_, i) => i !== ii));
  const updateItem = (ci, ii, field, val) => {
    const items = [...faq[ci].items];
    items[ii] = { ...items[ii], [field]: val };
    updateColumn(ci, items);
  };
  return (
    <div className="space-y-4">
      {faq.length === 0 && <p className="text-sm text-muted-foreground">Aucune colonne FAQ. Ajoutez-en une ci-dessous.</p>}
      {faq.map((col, ci) => (
        <div key={ci} className="border border-border rounded-xl p-4 bg-muted/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Colonne {ci + 1}</span>
            <Button type="button" variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={() => removeColumn(ci)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
          {(col.items || []).map((item, ii) => (
            <div key={ii} className="border border-border rounded-lg p-3 mb-2 bg-background">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Question {ii + 1}</span>
                <Button type="button" variant="ghost" size="icon" className="text-destructive h-6 w-6" onClick={() => removeItem(ci, ii)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <Input
                value={item.q}
                onChange={(e) => updateItem(ci, ii, 'q', e.target.value)}
                placeholder="Question"
                className="mb-2 rounded-lg"
              />
              <Textarea
                value={item.a}
                onChange={(e) => updateItem(ci, ii, 'a', e.target.value)}
                placeholder="Réponse"
                rows={2}
                className="rounded-lg resize-none"
              />
            </div>
          ))}
          <Button type="button" variant="ghost" size="sm" className="text-xs mt-1" onClick={() => addItem(ci)}>
            <Plus className="w-3 h-3 mr-1" /> Ajouter une question
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addColumn} disabled={faq.length >= 2}>
        <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter une colonne
      </Button>
    </div>
  );
}

const entityConfig = {
  hero_banners: {
    labelSingular: 'Hero Banner',
    defaultForm: { title: '', subtitle: '', image_url: '', link: '', sort_order: 0, is_active: true },
    fields: [
      { key: 'title', label: 'Title', required: true, placeholder: 'Summer Sale' },
      { key: 'subtitle', label: 'Subtitle', placeholder: 'Up to 50% off on all leggings' },
      { key: 'image_url', label: 'Image', type: 'image', required: true, fullWidth: true },
      { key: 'link', label: 'Link URL', type: 'url', required: true, placeholder: 'https://...', fullWidth: true },
      { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '0' },
    ],
  },
  home_sections: {
    labelSingular: 'Section',
    defaultForm: { title: '', description: '', section_type: 'products', category: '', featured_section_id: null, featured_section_id_2: null, selected_ids: [], ad_display_type: '', sort_order: 0, product_limit: 8, is_active: true, sort_by: '', brand_filter: '', min_rating: 0 },
    fields: [
      { key: 'title', label: 'Title', required: true, placeholder: 'Best Sellers' },
      { key: 'description', label: 'Short Description', type: 'textarea', rows: 2, fullWidth: true, placeholder: 'Optional short description below the title' },
      { key: 'section_type', label: 'Section Type', type: 'select', options: SECTION_TYPES, fullWidth: true },
      { key: 'ad_display_type', label: 'Ad Display Type', type: 'select', fullWidth: true,
        condition: { field: 'section_type', value: 'ad_banner' },
        options: AD_DISPLAY_TYPES,
      },
      { key: 'category', label: 'Category (for products)', placeholder: 'e.g. Women, Men...',
        condition: { field: 'section_type', value: 'products' } },
      { key: 'featured_section_id', label: 'Featured Section (Left)', type: 'select', fullWidth: true,
        condition: { field: 'section_type', value: 'featured' },
        options: async () => {
          const { data } = await supabase.from('featured_sections').select('id, title').eq('is_active', true).order('sort_order');
          return (data || []).map((s) => ({ value: s.id, label: s.title }));
        },
      },
      { key: 'featured_section_id_2', label: 'Featured Section (Right)', type: 'select', fullWidth: true,
        condition: { field: 'section_type', value: 'featured' },
        options: async () => {
          const { data } = await supabase.from('featured_sections').select('id, title').eq('is_active', true).order('sort_order');
          return (data || []).map((s) => ({ value: s.id, label: s.title }));
        },
      },
      { key: 'selected_ids', label: 'Select Items', type: 'multi-select', fullWidth: true,
        condition: { field: 'section_type', value: 'cta_cards' },
        options: async () => {
          const { data } = await supabase.from('cta_cards').select('id, title, image_url').eq('is_active', true).order('sort_order');
          return (data || []).map((s) => ({ value: s.id, label: s.title, image: s.image_url }));
        },
      },
      { key: 'selected_ids', label: 'Select Editorial Cards', type: 'multi-select', fullWidth: true,
        condition: { field: 'section_type', value: 'editorial' },
        options: async () => {
          const { data } = await supabase.from('editorial_cards').select('id, title, image_url').eq('is_active', true).order('sort_order');
          return (data || []).map((s) => ({ value: s.id, label: s.title, image: s.image_url }));
        },
      },
      { key: 'selected_ids', label: 'Select Ad Banners', type: 'multi-select', fullWidth: true,
        condition: { field: 'section_type', value: 'ad_banner' },
        deps: ['ad_display_type'],
        options: async (form) => {
          const displayType = form?.ad_display_type;
          let query = supabase.from('ad_banners').select('id, title, image_url, display_type').eq('is_active', true);
          if (displayType) query = query.eq('display_type', displayType);
          const { data } = await query.order('sort_order');
          return (data || []).map((s) => ({ value: s.id, label: s.title || s.display_type || s.id.slice(0, 8), image: s.image_url }));
        },
      },
      { key: 'selected_ids', label: 'Select Articles', type: 'multi-select', fullWidth: true,
        condition: { field: 'section_type', value: 'articles' },
        options: async () => {
          const { data } = await supabase.from('pages').select('id, title, cover_image').eq('type', 'blog_post').eq('published', true).order('published_at', { ascending: false });
          return (data || []).map((s) => ({ value: s.id, label: s.title, image: s.cover_image }));
        },
      },
      { key: 'product_limit', label: 'Product Limit', type: 'number', placeholder: '8',
        condition: { field: 'section_type', value: 'products' } },
      { key: 'sort_by', label: 'Sort By', type: 'select',
        condition: { field: 'section_type', value: 'products' },
        options: [
          { value: '', label: 'Default (Top Rated)' },
          { value: 'rating.desc.nullslast,ratings_count.desc.nullslast', label: 'Top Rated' },
          { value: 'ratings_count.desc.nullslast', label: 'Most Reviews' },
          { value: 'price.asc.nullslast', label: 'Price: Low to High' },
          { value: 'price.desc.nullslast', label: 'Price: High to Low' },
          { value: 'best_seller_rank.asc.nullslast', label: 'Best Seller' },
        ],
      },
      { key: 'brand_filter', label: 'Brand Filter', placeholder: 'e.g. Nike, Adidas...',
        condition: { field: 'section_type', value: 'products' } },
      { key: 'min_rating', label: 'Min Rating', type: 'number', placeholder: '0',
        condition: { field: 'section_type', value: 'products' } },
      { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '0' },
    ],
  },
  category_tags: {
    labelSingular: 'Tag',
    defaultForm: { label: '', value: '', description: '', image_url: '', link: '', sort_order: 0, is_active: true },
    fields: [
      { key: 'label', label: 'Label', required: true, placeholder: 'Women' },
      { key: 'value', label: 'Value (URL parameter)', required: true, placeholder: 'Women' },
      { key: 'description', label: 'Description (SEO)', type: 'textarea', rows: 3, fullWidth: true, placeholder: 'A short description of this category for SEO...' },
      { key: 'link', label: 'Custom Link (optional)', type: 'url', placeholder: '/catalogue?category=...' },
      { key: 'image_url', label: 'Image', type: 'image', fullWidth: true },
      { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '0' },
    ],
  },
  home_categories: {
    labelSingular: 'Category',
    defaultForm: { label: '', value: '', description: '', image_url: '', faq_schema: [], sort_order: 0, is_active: true },
    fields: [
      { key: 'label', label: 'Label', required: true, placeholder: 'Yoga' },
      { key: 'value', label: 'Value (URL parameter)', required: true, placeholder: 'Yoga' },
      { key: 'description', label: 'Description (SEO)', type: 'textarea', rows: 3, fullWidth: true, placeholder: 'A short description of this category for SEO...' },
      { key: 'image_url', label: 'Image', type: 'image', fullWidth: true },
      { key: 'faq_schema', label: 'Schema FAQ', type: 'faq_columns', sidebar: true },
      { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '0' },
    ],
  },
  catalogue_pages: {
    labelSingular: 'Catalogue Page',
    defaultForm: { label: '', value: '', description: '', image_url: '', link: '', faq_schema: [], sort_order: 0, is_active: true },
    fields: [
      { key: 'label', label: 'Label', required: true, placeholder: 'Yoga' },
      { key: 'value', label: 'Value (URL parameter)', required: true, placeholder: 'Yoga' },
      { key: 'description', label: 'Description (SEO)', type: 'textarea', rows: 3, fullWidth: true, placeholder: 'A short description of this category for SEO...' },
      { key: 'link', label: 'Custom Link (optional)', type: 'url', placeholder: '/catalogue?category=...' },
      { key: 'image_url', label: 'Image', type: 'image', fullWidth: true },
      { key: 'faq_schema', label: 'Schema FAQ', type: 'faq_columns', sidebar: true },
      { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '0' },
    ],
  },
  cta_cards: {
    labelSingular: 'CTA Card',
    defaultForm: { title: '', image_url: '', link: '', bg_color: '#f3f4f6', text_color: '#000000', sort_order: 0, is_active: true },
    fields: [
      { key: 'title', label: 'Title', required: true, placeholder: 'Shop Now' },
      { key: 'image_url', label: 'Image', type: 'image', fullWidth: true },
      { key: 'link', label: 'Link URL', type: 'url', required: true, placeholder: 'https://...', fullWidth: true },
      { key: 'bg_color', label: 'Background Color', placeholder: '#f3f4f6' },
      { key: 'text_color', label: 'Text Color', placeholder: '#000000' },
      { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '0' },
    ],
  },
  editorial_cards: {
    labelSingular: 'Editorial Card',
    defaultForm: { title: '', description: '', image_url: '', button_text: '', button_link: '', secondary_text: '', secondary_link: '', sort_order: 0, is_active: true },
    fields: [
      { key: 'title', label: 'Title', required: true, placeholder: 'Spring Collection' },
      { key: 'description', label: 'Description', type: 'textarea', rows: 2, fullWidth: true },
      { key: 'image_url', label: 'Image', type: 'image', fullWidth: true },
      { key: 'button_text', label: 'Button Text', placeholder: 'Shop Now' },
      { key: 'button_link', label: 'Button Link', placeholder: 'https://...' },
      { key: 'secondary_text', label: 'Secondary Text', placeholder: 'Learn more' },
      { key: 'secondary_link', label: 'Secondary Link', placeholder: 'https://...' },
      { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '0' },
    ],
  },
  ad_banners: {
    labelSingular: 'Ad Banner',
    defaultForm: { type: 'image', display_type: 'full', title: '', subtitle: '', image_url: '', link: '', button_text: '', bg_color: '#000000', script_content: '', sort_order: 0, is_active: true },
    fields: [
      { key: 'display_type', label: 'Display Type', type: 'select', options: AD_DISPLAY_TYPES, fullWidth: true },
      { key: 'title', label: 'Title', placeholder: 'Special Offer' },
      { key: 'subtitle', label: 'Subtitle', fullWidth: true },
      { key: 'image_url', label: 'Image', type: 'image', fullWidth: true },
      { key: 'link', label: 'Link URL', type: 'url', fullWidth: true },
      { key: 'button_text', label: 'Button Text', placeholder: 'Shop Now' },
      { key: 'bg_color', label: 'Background Color', placeholder: '#000000' },
      { key: 'script_content', label: 'Script Content (HTML)', type: 'textarea', rows: 2, fullWidth: true },
      { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '0' },
    ],
  },
  featured_sections: {
    labelSingular: 'Featured Section',
    defaultForm: { title: '', format: 'product', category: '', product_limit: 3, content: '', image_url: '', subtitle: '', link: '', script_content: '', sort_order: 0, is_active: true },
    fields: [
      { key: 'title', label: 'Title', required: true, placeholder: 'Favorites for a reason' },
      { key: 'format', label: 'Format', type: 'select', options: FEATURED_FORMAT_TYPES, fullWidth: true },
      { key: 'category', label: 'Category', condition: { field: 'format', value: 'product' }, required: true, placeholder: 'e.g. Biker Shorts, Yoga Pants...' },
      { key: 'product_limit', label: 'Product Limit', type: 'number', condition: { field: 'format', value: 'product' }, placeholder: '4' },
      { key: 'image_url', label: 'Image', type: 'image', fullWidth: true, condition: { field: 'format', value: 'banner' } },
      { key: 'subtitle', label: 'Description', fullWidth: true, condition: { field: 'format', value: 'banner' } },
      { key: 'link', label: 'Link URL', type: 'url', fullWidth: true, condition: { field: 'format', value: 'banner' } },
      { key: 'script_content', label: 'Ad Script (HTML)', type: 'textarea', rows: 2, fullWidth: true, condition: { field: 'format', value: 'banner' } },
      { key: 'content', label: 'Content (paragraph)', type: 'textarea', rows: 3, fullWidth: true, condition: { field: 'format', value: 'text' } },
      { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '0' },
    ],
  },
};

const entityFolders = {
  hero_banners: 'hero-banners',
  home_sections: 'home-sections',
  category_tags: 'category-tags',
  home_categories: 'home-categories',
  cta_cards: 'cta-cards',
  editorial_cards: 'editorial-cards',
  ad_banners: 'ad-banners',
  featured_sections: 'featured-sections',
  catalogue_pages: 'catalogue-pages',
};

export default function AdminHome() {
  const [tab, setTab] = useState('hero_banners');

  return (
    <div>
      <div className="flex gap-1 flex-wrap mb-6">
        {homeTabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${tab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {homeTabs.map((t) => tab === t.id && (
        <EntityManager key={t.id} table={t.table} {...entityConfig[t.id]} imageFolder={entityFolders[t.id]} />
      ))}
    </div>
  );
}
