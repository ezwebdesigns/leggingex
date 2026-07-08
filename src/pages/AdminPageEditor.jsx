import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TiptapEditor from '@/components/admin/TiptapEditor';
import ImageUploader from '@/components/admin/ImageUploader';

const PAGE_TYPES = [
  { value: 'static_page', label: 'Static Page' },
  { value: 'blog_post', label: 'Blog Post' },
];

const EMPTY_FORM = {
  slug: '', title: '', content: '', type: 'static_page',
  excerpt: '', cover_image: '', author: '', category: 'News',
  seo_title: '', meta_description: '', keywords: [],
  faq: [], cta_title: '', cta_button: '', cta_link: '',
  published: false, published_at: '',
};

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function FaqEditor({ items, onChange }) {
  const add = () => onChange([...items, { question: '', answer: '' }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, field, value) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border border-border rounded-xl p-4 bg-muted/20 relative">
          <button type="button" onClick={() => remove(i)} className="absolute top-2 right-2 w-6 h-6 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive">
            <X className="w-3 h-3" />
          </button>
          <div className="space-y-2">
            <Input placeholder="Question" value={item.question} onChange={(e) => update(i, 'question', e.target.value)} className="rounded-lg" />
            <Textarea placeholder="Answer" rows={2} value={item.answer} onChange={(e) => update(i, 'answer', e.target.value)} className="rounded-lg resize-none" />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="rounded-lg">
        <Plus className="w-3.5 h-3.5 mr-1" /> Add FAQ
      </Button>
    </div>
  );
}

export default function AdminPageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (id) {
      supabase.from('pages').select('*').eq('id', id).single()
        .then(({ data, error }) => {
          if (data && !error) {
            setForm({
              ...EMPTY_FORM,
              ...data,
              published_at: data.published_at?.split('T')[0] || '',
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  const autoSlug = (title) => {
    if (!isEdit && !form.slug) set('slug', slugify(title));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.slug) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        published_at: form.published ? (form.published_at || new Date().toISOString().split('T')[0]) : null,
        updated_at: new Date().toISOString(),
      };
      if (isEdit) {
        await supabase.from('pages').update(payload).eq('id', id);
      } else {
        await supabase.from('pages').insert({ ...payload, created_at: new Date().toISOString() });
      }
      navigate('/admin/pages');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 w-full bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/pages')} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold">{isEdit ? 'Edit Page' : 'New Page'}</h1>
        </div>
        <div className="flex items-center gap-3">
          {form.slug && (
            <Button type="button" variant="outline" onClick={() => window.open(`/${form.slug}?preview=true`, '_blank')} className="rounded-xl">
              Preview
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/admin/pages')} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-xl">
            {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="border border-border rounded-2xl p-5 bg-card">
          <h2 className="text-sm font-semibold text-foreground mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title *</Label>
              <Input value={form.title} onChange={(e) => { set('title', e.target.value); autoSlug(e.target.value); }} required className="mt-1 rounded-xl" placeholder="Page title" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Slug *</Label>
              <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} required className="mt-1 rounded-xl" placeholder="my-page" />
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
            {form.type === 'blog_post' && (
              <>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Author</Label>
                  <Input value={form.author} onChange={(e) => set('author', e.target.value)} className="mt-1 rounded-xl" placeholder="Editorial Team" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</Label>
                  <Input value={form.category} onChange={(e) => set('category', e.target.value)} className="mt-1 rounded-xl" placeholder="News" />
                </div>
              </>
            )}
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Excerpt</Label>
              <Textarea value={form.excerpt || ''} onChange={(e) => set('excerpt', e.target.value)} className="mt-1 rounded-xl resize-none" rows={2} placeholder="Short summary..." />
            </div>
          </div>
        </div>

        <div className="border border-border rounded-2xl p-5 bg-card">
          <h2 className="text-sm font-semibold text-foreground mb-4">Featured Image</h2>
          <ImageUploader value={form.cover_image} onChange={(url) => set('cover_image', url)} folder="pages" label="Cover Image" />
        </div>

        <div className="border border-border rounded-2xl p-5 bg-card">
          <h2 className="text-sm font-semibold text-foreground mb-4">Content</h2>
          <TiptapEditor value={form.content} onChange={(html) => set('content', html)} placeholder="Start writing..." />
        </div>

        <div className="border border-border rounded-2xl p-5 bg-card">
          <h2 className="text-sm font-semibold text-foreground mb-4">SEO</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">SEO Title</Label>
              <Input value={form.seo_title || ''} onChange={(e) => set('seo_title', e.target.value)} className="mt-1 rounded-xl" placeholder="Custom title for search engines" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Meta Description</Label>
              <Textarea value={form.meta_description || ''} onChange={(e) => set('meta_description', e.target.value)} className="mt-1 rounded-xl resize-none" rows={2} placeholder="Short description for search results" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Keywords (one per line)</Label>
              <Textarea value={(form.keywords || []).join('\n')} onChange={(e) => set('keywords', e.target.value.split('\n').filter(Boolean))} className="mt-1 rounded-xl resize-none" rows={3} placeholder="leggings&#10;yoga pants&#10;activewear" />
            </div>
          </div>
        </div>

        <div className="border border-border rounded-2xl p-5 bg-card">
          <h2 className="text-sm font-semibold text-foreground mb-4">FAQ</h2>
          <FaqEditor items={form.faq || []} onChange={(items) => set('faq', items)} />
        </div>

        <div className="border border-border rounded-2xl p-5 bg-card">
          <h2 className="text-sm font-semibold text-foreground mb-4">Call to Action</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CTA Title</Label>
              <Input value={form.cta_title || ''} onChange={(e) => set('cta_title', e.target.value)} className="mt-1 rounded-xl" placeholder="Ready to find your pair?" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Button Text</Label>
              <Input value={form.cta_button || ''} onChange={(e) => set('cta_button', e.target.value)} className="mt-1 rounded-xl" placeholder="Shop Now" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Button Link</Label>
              <Input value={form.cta_link || ''} onChange={(e) => set('cta_link', e.target.value)} className="mt-1 rounded-xl" placeholder="https://..." />
            </div>
          </div>
        </div>

        <div className="border border-border rounded-2xl p-5 bg-card">
          <h2 className="text-sm font-semibold text-foreground mb-4">Publishing</h2>
          <div className="flex items-center gap-4">
            <Switch checked={form.published} onCheckedChange={(v) => set('published', v)} />
            <Label className="text-sm text-foreground">Published</Label>
            {form.published && (
              <div className="ml-auto">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-2">Published At</Label>
                <Input type="date" value={form.published_at} onChange={(e) => set('published_at', e.target.value)} className="inline-flex w-auto rounded-xl" />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/pages')} className="flex-1 rounded-xl">Cancel</Button>
          <Button type="submit" disabled={saving} className="flex-1 rounded-xl">
            {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
          </Button>
        </div>
      </form>
    </div>
  );
}
