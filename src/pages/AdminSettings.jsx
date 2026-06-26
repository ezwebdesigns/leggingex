import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { invalidateSettings } from '../lib/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { Globe, Image, FileText, Share2, Settings2, Menu, Hash, Code, Palette, Link } from 'lucide-react';

const TABS = [
  { id: 'General', label: 'General', icon: Settings2 },
  { id: 'Sidebar', label: 'Sidebar', icon: Menu },
  { id: 'Menu & Footer', label: 'Menu & Footer', icon: FileText },
  { id: 'SEO', label: 'SEO', icon: Globe },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('General');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      const map = {};
      data.forEach((row) => { map[row.key] = row.value; });
      setSettings(map);
    }
    setLoading(false);
  }

  function update(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const upserts = Object.entries(settings).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from('settings').upsert(upserts, { onConflict: 'key' });
    if (error) {
      toast.error('Save failed: ' + error.message);
    } else {
      invalidateSettings();
      toast.success('Settings saved');
    }
    setSaving(false);
  }

  async function handleImageUpload(key, subKey) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const ext = file.name.split('.').pop();
      const path = `settings/${subKey}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(path, file);
      if (uploadError) { toast.error('Upload failed: ' + uploadError.message); return; }
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(path);
      const url = urlData.publicUrl;
      const current = settings[key] || {};
      update(key, { ...current, [subKey]: url });
      toast.success('Image uploaded');
    };
    input.click();
  }

  function SectionCard({ title, icon: Icon, children, description }) {
    return (
      <div className="border border-border rounded-2xl p-5 mb-5 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        {children}
      </div>
    );
  }

  function Field({ label, description, children }) {
    return (
      <div className="mb-4 last:mb-0">
        <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
        {description && <p className="text-xs text-muted-foreground mb-2">{description}</p>}
        {children}
      </div>
    );
  }

  function ImagePicker({ value, label, onUpload }) {
    return (
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-16 h-16 rounded-xl border border-border overflow-hidden bg-muted flex-shrink-0">
            <img src={value} alt={label} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-xl border border-border border-dashed bg-muted/30 flex items-center justify-center flex-shrink-0">
            <Image className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        <div>
          <Button type="button" variant="outline" size="sm" onClick={onUpload}>
            {value ? 'Change' : 'Upload'}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" className="text-destructive ml-2" onClick={() => onUpload('remove')}>
              Remove
            </Button>
          )}
        </div>
      </div>
    );
  }

  function renderGeneral() {
    const general = settings.general || {};
    return (
      <div className="space-y-5">
        <SectionCard title="Branding" icon={Palette} description="Site logo and favicon">
          <Field label="Logo" description="Your brand logo, displayed in the header">
            <ImagePicker
              value={general.logo}
              label="Logo"
              onUpload={(action) => {
                if (action === 'remove') {
                  const { logo, ...rest } = general;
                  update('general', rest);
                } else {
                  handleImageUpload('general', 'logo');
                }
              }}
            />
          </Field>
          <Field label="Favicon" description="Small icon shown in browser tabs (16×16 or 32×32)">
            <ImagePicker
              value={general.favicon}
              label="Favicon"
              onUpload={(action) => {
                if (action === 'remove') {
                  const { favicon, ...rest } = general;
                  update('general', rest);
                } else {
                  handleImageUpload('general', 'favicon');
                }
              }}
            />
          </Field>
        </SectionCard>

        <SectionCard title="Site Information" icon={Globe} description="Basic site-wide settings">
          <Field label="Site Title" description="The name of your site, used in browser tabs and headers">
            <Input
              value={general.site_title || ''}
              onChange={(e) => update('general', { ...general, site_title: e.target.value })}
              placeholder="My Store"
            />
          </Field>
        </SectionCard>
      </div>
    );
  }

  function renderSidebar() {
    const sidebar = settings.sidebar || {};
    return (
      <div className="space-y-5">
        <SectionCard title="Articles" icon={FileText} description="Recent articles widget settings">
          <Field label="Section Title" description="Heading displayed above the recent articles list">
            <Input
              value={sidebar.recent_articles_title || ''}
              onChange={(e) => update('sidebar', { ...sidebar, recent_articles_title: e.target.value })}
              placeholder="Recent Articles"
            />
          </Field>
          <Field label="Number of Articles" description="How many recent articles to show">
            <Input
              type="number"
              value={sidebar.recent_articles_count ?? 3}
              onChange={(e) => update('sidebar', { ...sidebar, recent_articles_count: parseInt(e.target.value) || 3 })}
              className="w-32"
            />
          </Field>
        </SectionCard>

        <SectionCard title="Advertising" icon={Code} description="Custom ad script for the sidebar">
          <Field label="Ad Script" description="HTML/JavaScript ad code (e.g. Google AdSense)">
            <Textarea
              className="font-mono text-xs"
              rows={6}
              value={sidebar.ad_script || ''}
              onChange={(e) => update('sidebar', { ...sidebar, ad_script: e.target.value })}
              placeholder="<script>...</script>"
            />
          </Field>
        </SectionCard>
      </div>
    );
  }

  function renderMenuFooter() {
    const menuFooter = settings.menu_footer || {};
    const social = menuFooter.social || [];
    const columns = menuFooter.columns || [];

    return (
      <div className="space-y-5">
        <SectionCard title="Footer Branding" icon={Palette} description="Logo text and description in the footer">
          <Field label="Logo Text" description="Text shown next to the footer logo icon (or as alt text if logo image is set)">
            <Input
              value={menuFooter.logo_text || ''}
              onChange={(e) => update('menu_footer', { ...menuFooter, logo_text: e.target.value })}
              placeholder="leggings"
            />
          </Field>
          <Field label="Description" description="Short text describing your site, shown below the logo">
            <Textarea
              rows={3}
              value={menuFooter.description || ''}
              onChange={(e) => update('menu_footer', { ...menuFooter, description: e.target.value })}
              placeholder="Discover the best leggings..."
            />
          </Field>
        </SectionCard>

        <SectionCard title="Social Links" icon={Share2} description="Social media profiles displayed in the footer">
          {social.length === 0 && (
            <p className="text-sm text-muted-foreground mb-3">No social links yet. Add your first one below.</p>
          )}
          {social.map((s, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <Input
                placeholder="Platform (e.g. Instagram)"
                className="w-1/3"
                value={s.platform}
                onChange={(e) => {
                  const next = [...social];
                  next[i] = { ...next[i], platform: e.target.value };
                  update('menu_footer', { ...menuFooter, social: next });
                }}
              />
              <Input
                placeholder="Profile URL"
                className="flex-1"
                value={s.url}
                onChange={(e) => {
                  const next = [...social];
                  next[i] = { ...next[i], url: e.target.value };
                  update('menu_footer', { ...menuFooter, social: next });
                }}
              />
              <Button variant="ghost" size="icon" className="text-destructive flex-shrink-0" onClick={() => {
                update('menu_footer', { ...menuFooter, social: social.filter((_, idx) => idx !== i) });
              }}>
                <span className="sr-only">Remove</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() =>
            update('menu_footer', { ...menuFooter, social: [...social, { platform: '', url: '' }] })
          } className="mt-2">
            + Add Social Link
          </Button>
        </SectionCard>

        <SectionCard title="Footer Columns" icon={Menu} description="Navigation columns in the footer">
          {columns.length === 0 && (
            <p className="text-sm text-muted-foreground mb-3">No columns yet. Add your first column below.</p>
          )}
          {columns.map((col, ci) => (
            <div key={ci} className="border border-border rounded-xl p-4 mb-3 bg-muted/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Column {ci + 1}</span>
                  <Input
                    placeholder="Column Title"
                    className="flex-1 h-8"
                    value={col.title}
                    onChange={(e) => {
                      const next = [...columns];
                      next[ci] = { ...next[ci], title: e.target.value };
                      update('menu_footer', { ...menuFooter, columns: next });
                    }}
                  />
                </div>
                <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 flex-shrink-0" onClick={() => {
                  update('menu_footer', { ...menuFooter, columns: columns.filter((_, idx) => idx !== ci) });
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </Button>
              </div>
              {(col.items || []).map((item, ii) => (
                <div key={ii} className="flex items-center gap-2 mb-1.5">
                  <Input
                    placeholder="Link Label"
                    className="flex-1 h-8"
                    value={item.label}
                    onChange={(e) => {
                      const next = [...columns];
                      next[ci].items[ii] = { ...next[ci].items[ii], label: e.target.value };
                      update('menu_footer', { ...menuFooter, columns: next });
                    }}
                  />
                  <Input
                    placeholder="URL"
                    className="flex-1 h-8"
                    value={item.url}
                    onChange={(e) => {
                      const next = [...columns];
                      next[ci].items[ii] = { ...next[ci].items[ii], url: e.target.value };
                      update('menu_footer', { ...menuFooter, columns: next });
                    }}
                  />
                  <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 flex-shrink-0" onClick={() => {
                    const next = [...columns];
                    next[ci].items = next[ci].items.filter((_, idx) => idx !== ii);
                    update('menu_footer', { ...menuFooter, columns: next });
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="mt-1 text-xs" onClick={() => {
                const next = [...columns];
                next[ci].items = [...(next[ci].items || []), { label: '', url: '' }];
                update('menu_footer', { ...menuFooter, columns: next });
              }}>
                + Add Link
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() =>
            update('menu_footer', { ...menuFooter, columns: [...columns, { title: '', items: [{ label: '', url: '' }] }] })
          }>
            + Add Column
          </Button>
        </SectionCard>
      </div>
    );
  }

  function renderSeo() {
    const seo = settings.seo || {};
    return (
      <div className="space-y-5">
        <SectionCard title="Meta Tags" icon={Hash} description="Search engine meta information">
          <Field label="Meta Title" description="The default title tag for your site (used by search engines)">
            <Input
              value={seo.meta_title || ''}
              onChange={(e) => update('seo', { ...seo, meta_title: e.target.value })}
              placeholder="My Store — Best Products Online"
            />
          </Field>
          <Field label="Meta Description" description="A short description of your site (appears in search results)">
            <Textarea
              rows={3}
              value={seo.meta_description || ''}
              onChange={(e) => update('seo', { ...seo, meta_description: e.target.value })}
              placeholder="Discover amazing products at great prices..."
            />
          </Field>
          <Field label="Keywords" description="Comma-separated keywords for search engines">
            <Input
              value={seo.keywords || ''}
              onChange={(e) => update('seo', { ...seo, keywords: e.target.value })}
              placeholder="leggings, yoga pants, activewear"
            />
          </Field>
        </SectionCard>

        <SectionCard title="Open Graph" icon={Share2} description="Social sharing preview settings">
          <Field label="OG Image" description="Default image shown when your site is shared on social media (Facebook, Twitter, etc.)">
            <ImagePicker
              value={seo.og_image}
              label="OG Image"
              onUpload={(action) => {
                if (action === 'remove') {
                  const { og_image, ...rest } = seo;
                  update('seo', rest);
                } else {
                  handleImageUpload('seo', 'og_image');
                }
              }}
            />
          </Field>
        </SectionCard>

        <SectionCard title="Technical SEO" icon={Code} description="Sitemap and robots.txt configuration">
          <Field label="Sitemap URL" description="Link to your XML sitemap">
            <Input
              value={seo.sitemap || ''}
              onChange={(e) => update('seo', { ...seo, sitemap: e.target.value })}
              placeholder="https://example.com/sitemap.xml"
            />
          </Field>
          <Field label="Robots.txt" description="Custom robots.txt content (leave empty for default)">
            <Textarea
              className="font-mono text-xs"
              rows={6}
              value={seo.robots_txt || ''}
              onChange={(e) => update('seo', { ...seo, robots_txt: e.target.value })}
              placeholder="User-agent: *&#10;Allow: /"
            />
          </Field>
        </SectionCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-12 w-full bg-muted rounded-xl animate-pulse" />
        <div className="h-64 w-full bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your site configuration</p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg" className="rounded-xl px-6">
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Saving...
            </span>
          ) : 'Save Settings'}
        </Button>
      </div>

      <div className="flex gap-1 flex-wrap mb-6 p-1 bg-muted/50 rounded-xl">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === id
                ? 'bg-background text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'General' && renderGeneral()}
      {activeTab === 'Sidebar' && renderSidebar()}
      {activeTab === 'Menu & Footer' && renderMenuFooter()}
      {activeTab === 'SEO' && renderSeo()}
    </div>
  );
}
