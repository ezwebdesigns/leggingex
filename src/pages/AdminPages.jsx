import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const PAGE_TYPES = [
  { value: 'static_page', label: 'Static Page' },
  { value: 'blog_post', label: 'Blog Post' },
];

const EMPTY_FORM = { slug: '', title: '', content: '', type: 'static_page', excerpt: '', cover_image: '', published: false, published_at: '' };

export default function AdminPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPage, setEditPage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('pages').select('*').order('created_at', { ascending: false }).limit(200);
      setPages(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      const data = {
        ...payload,
        published_at: payload.published ? (payload.published_at || new Date().toISOString().split('T')[0]) : null,
        updated_at: new Date().toISOString(),
      };
      if (editPage) {
        await supabase.from('pages').update(data).eq('id', editPage.id);
      } else {
        await supabase.from('pages').insert({ ...data, created_at: new Date().toISOString() });
      }
      setShowForm(false);
      setEditPage(null);
      fetchPages();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this page?')) return;
    await supabase.from('pages').delete().eq('id', id);
    fetchPages();
  };

  const togglePublished = async (page) => {
    await supabase.from('pages').update({
      published: !page.published,
      published_at: !page.published ? new Date().toISOString().split('T')[0] : null,
      updated_at: new Date().toISOString(),
    }).eq('id', page.id);
    fetchPages();
  };

  const filtered = pages.filter((p) => {
    if (filter !== 'all' && p.type !== filter) return false;
    if (!search) return true;
    return [p.title, p.slug, p.excerpt].some((s) => s?.toLowerCase().includes(search.toLowerCase()));
  });

  const typeLabel = (type) => PAGE_TYPES.find((t) => t.value === type)?.label || type;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <h2 className="text-lg font-semibold text-foreground">Pages ({pages.length})</h2>
        <Button onClick={() => { setShowForm(true); setEditPage(null); }} className="rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Page
        </Button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pages..." className="max-w-sm rounded-xl" />
        <div className="flex gap-1">
          {[{ value: 'all', label: 'All' }, ...PAGE_TYPES].map((t) => (
            <button key={t.value} onClick={() => setFilter(t.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filter === t.value ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 bg-muted rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <span className="text-4xl block mb-3">📝</span>
          <p className="font-medium">No pages found.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Slug</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.cover_image ? (
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img src={p.cover_image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : <div className="w-9 h-9 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center text-lg">{p.type === 'blog_post' ? '📝' : '📄'}</div>}
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">{p.title}</p>
                        <p className="text-xs text-muted-foreground">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">/{p.slug}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${p.type === 'blog_post' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {typeLabel(p.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <button onClick={() => togglePublished(p)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${p.published ? 'bg-green-50 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {p.published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditPage(p); setShowForm(true); }}
                        className="w-8 h-8 rounded-xl hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                        className="w-8 h-8 rounded-xl hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive">
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
        <PageForm
          page={editPage}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditPage(null); }}
          saving={saving}
        />
      )}
    </div>
  );
}

function PageForm({ page, onSave, onCancel, saving }) {
  const [form, setForm] = useState(page ? { ...EMPTY_FORM, ...page, published_at: page.published_at?.split('T')[0] || '' } : EMPTY_FORM);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.slug) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onCancel}>
      <div className="w-full max-w-3xl bg-background rounded-3xl border border-border shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-bold">{page ? 'Edit Page' : 'New Page'}</h2>
          <button onClick={onCancel} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title *</Label>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} required className="mt-1 rounded-xl" placeholder="Page title" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Slug *</Label>
              <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} required className="mt-1 rounded-xl" placeholder="privacy-policy" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</Label>
              <Select value={form.type} onValueChange={(v) => set('type', v)}>
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {PAGE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Published At (date)</Label>
              <Input value={form.published_at} onChange={(e) => set('published_at', e.target.value)} className="mt-1 rounded-xl" type="date" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cover Image URL</Label>
              <Input value={form.cover_image || ''} onChange={(e) => set('cover_image', e.target.value)} className="mt-1 rounded-xl" placeholder="https://..." type="url" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Excerpt</Label>
              <Textarea value={form.excerpt || ''} onChange={(e) => set('excerpt', e.target.value)} className="mt-1 rounded-xl resize-none" rows={2} placeholder="Short summary..." />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Content (HTML)</Label>
            <Textarea value={form.content} onChange={(e) => set('content', e.target.value)} required className="mt-1 rounded-xl font-mono text-sm" rows={12} placeholder="<h1>Hello</h1><p>Content here...</p>" />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.published} onCheckedChange={(v) => set('published', v)} />
            <Label className="text-sm text-foreground">Published</Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-xl">
              {saving ? 'Saving...' : (page ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
