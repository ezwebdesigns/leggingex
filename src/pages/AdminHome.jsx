import { useState, useEffect, useCallback } from 'react';
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
  { value: 'cta_cards', label: 'CTA Cards' },
  { value: 'editorial', label: 'Editorial Row' },
  { value: 'ad_banner', label: 'Ad Banner' },
  { value: 'articles', label: 'Recent Articles' },
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
];

function EntityForm({ entity, fields, initial, onSave, onCancel, saving, imageFolder }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    fields.forEach((f) => {
      if (f.type === 'number' && payload[f.key]) payload[f.key] = parseFloat(payload[f.key]);
    });
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} className={f.fullWidth ? 'sm:col-span-2' : ''}>
            {f.type === 'image' ? (
              <ImageUploader
                value={form[f.key] || ''}
                onChange={(url) => set(f.key, url)}
                folder={imageFolder || 'general'}
                label={f.label}
              />
            ) : (
              <>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {f.label} {f.required ? '*' : ''}
                </Label>
                {f.type === 'textarea' ? (
              <Textarea
                value={form[f.key] || ''}
                onChange={(e) => set(f.key, e.target.value)}
                className="mt-1 rounded-xl resize-none"
                rows={f.rows || 3}
                required={f.required}
                placeholder={f.placeholder}
              />
            ) : f.type === 'select' ? (
              <Select value={form[f.key] || ''} onValueChange={(v) => set(f.key, v)}>
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {f.options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : f.type === 'switch' ? (
              <div className="mt-2">
                <Switch checked={form[f.key]} onCheckedChange={(v) => set(f.key, v)} />
              </div>
            ) : f.type === 'number' ? (
              <Input
                value={form[f.key] || ''}
                onChange={(e) => set(f.key, e.target.value)}
                className="mt-1 rounded-xl"
                type="number"
                step="0.01"
                placeholder={f.placeholder}
              />
            ) : (
              <Input
                value={form[f.key] || ''}
                onChange={(e) => set(f.key, e.target.value)}
                className="mt-1 rounded-xl"
                required={f.required}
                placeholder={f.placeholder}
                type={f.type === 'url' ? 'url' : 'text'}
              />
            )}
              </>
            )}
          </div>
        ))}
      </div>
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => { setShowForm(false); setEditItem(null); }}>
          <div className="w-full max-w-2xl bg-background rounded-3xl border border-border shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-lg font-bold">{editItem ? `Edit ${labelSingular}` : `New ${labelSingular}`}</h2>
              <button onClick={() => { setShowForm(false); setEditItem(null); }}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
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
                onCancel={() => { setShowForm(false); setEditItem(null); }}
                saving={saving}
              />
            </div>
          </div>
        </div>
      )}
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
    defaultForm: { title: '', section_type: 'products', category: '', sort_order: 0, product_limit: 8, is_active: true },
    fields: [
      { key: 'title', label: 'Title', required: true, placeholder: 'Best Sellers' },
      { key: 'section_type', label: 'Section Type', type: 'select', options: SECTION_TYPES, fullWidth: true },
      { key: 'category', label: 'Category (for products)', placeholder: 'e.g. Women, Men...' },
      { key: 'product_limit', label: 'Product Limit', type: 'number', placeholder: '8' },
      { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '0' },
    ],
  },
  category_tags: {
    labelSingular: 'Tag',
    defaultForm: { label: '', value: '', sort_order: 0, is_active: true },
    fields: [
      { key: 'label', label: 'Label', required: true, placeholder: 'Women' },
      { key: 'value', label: 'Value (URL parameter)', required: true, placeholder: 'Women' },
      { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '0' },
    ],
  },
  home_categories: {
    labelSingular: 'Category',
    defaultForm: { label: '', value: '', image_url: '', sort_order: 0, is_active: true },
    fields: [
      { key: 'label', label: 'Label', required: true, placeholder: 'Yoga' },
      { key: 'value', label: 'Value (URL parameter)', required: true, placeholder: 'Yoga' },
      { key: 'image_url', label: 'Image', type: 'image', fullWidth: true },
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
    defaultForm: { type: 'image', title: '', subtitle: '', image_url: '', link: '', button_text: '', bg_color: '#000000', script_content: '', sort_order: 0, is_active: true },
    fields: [
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
};

const entityFolders = {
  hero_banners: 'hero-banners',
  home_sections: 'home-sections',
  category_tags: 'category-tags',
  home_categories: 'home-categories',
  cta_cards: 'cta-cards',
  editorial_cards: 'editorial-cards',
  ad_banners: 'ad-banners',
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
