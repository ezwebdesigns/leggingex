import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PAGE_TYPES = [
  { value: 'static_page', label: 'Static Page' },
  { value: 'blog_post', label: 'Blog Post' },
];

export default function AdminPages() {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
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
        <Button onClick={() => navigate('/admin/pages/new')} className="rounded-xl flex items-center gap-2">
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
                      <button onClick={() => navigate(`/admin/pages/${p.id}/edit`)}
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
    </div>
  );
}
