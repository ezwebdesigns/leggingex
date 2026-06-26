import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { invalidateSettings } from '../lib/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';

const TABS = ['General', 'Sidebar', 'Menu & Footer', 'SEO'];

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
    const upserts = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
    }));
    const { error } = await supabase.from('settings').upsert(upserts, {
      onConflict: 'key',
    });
    if (error) {
      toast.error('Save failed: ' + error.message);
    } else {
      invalidateSettings();
      toast.success('Settings saved');
    }
    setSaving(false);
  }

  async function handleImageUpload(field) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const ext = file.name.split('.').pop();
      const path = `settings/${field}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(path, file);
      if (uploadError) {
        toast.error('Upload failed: ' + uploadError.message);
        return;
      }
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(path);
      const url = urlData.publicUrl;
      const current = settings[field === 'logo' || field === 'favicon' ? 'general' : 'seo'] || {};
      if (field === 'logo') {
        update('general', { ...current, logo: url });
      } else if (field === 'favicon') {
        update('general', { ...current, favicon: url });
      } else if (field === 'og_image') {
        update('seo', { ...current, og_image: url });
      }
      toast.success('Image uploaded');
    };
    input.click();
  }

  function renderGeneral() {
    const general = settings.general || {};
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Site Title</label>
          <Input
            value={general.site_title || ''}
            onChange={(e) =>
              update('general', { ...general, site_title: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Logo</label>
          <div className="flex items-center gap-3">
            {general.logo && (
              <img
                src={general.logo}
                alt="Logo"
                className="h-12 w-auto object-contain border border-border rounded"
              />
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => handleImageUpload('logo')}>
              Upload Logo
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Favicon</label>
          <div className="flex items-center gap-3">
            {general.favicon && (
              <img
                src={general.favicon}
                alt="Favicon"
                className="h-8 w-8 object-contain border border-border rounded"
              />
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => handleImageUpload('favicon')}>
              Upload Favicon
            </Button>
          </div>
        </div>
      </div>
    );
  }

  function renderSidebar() {
    const sidebar = settings.sidebar || {};
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Recent Articles Title</label>
          <Input
            value={sidebar.recent_articles_title || ''}
            onChange={(e) =>
              update('sidebar', { ...sidebar, recent_articles_title: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Recent Articles Count</label>
          <Input
            type="number"
            value={sidebar.recent_articles_count || 3}
            onChange={(e) =>
              update('sidebar', { ...sidebar, recent_articles_count: parseInt(e.target.value) || 3 })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ad Script</label>
          <Textarea
            className="font-mono text-xs"
            rows={6}
            value={sidebar.ad_script || ''}
            onChange={(e) =>
              update('sidebar', { ...sidebar, ad_script: e.target.value })
            }
          />
        </div>
      </div>
    );
  }

  function renderMenuFooter() {
    const menuFooter = settings.menu_footer || {};
    const social = menuFooter.social || [{ platform: '', url: '' }];
    const columns = menuFooter.columns || [
      { title: 'CATEGORIES', items: [{ label: '', url: '' }] },
      { title: 'SHOP BY STYLES', items: [{ label: '', url: '' }] },
    ];

    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Logo Text</label>
          <Input
            value={menuFooter.logo_text || ''}
            onChange={(e) => update('menu_footer', { ...menuFooter, logo_text: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            rows={3}
            value={menuFooter.description || ''}
            onChange={(e) => update('menu_footer', { ...menuFooter, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Social Links</label>
          {social.map((s, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <Input
                placeholder="Platform"
                className="w-1/3"
                value={s.platform}
                onChange={(e) => {
                  const next = [...social];
                  next[i] = { ...next[i], platform: e.target.value };
                  update('menu_footer', { ...menuFooter, social: next });
                }}
              />
              <Input
                placeholder="URL"
                className="flex-1"
                value={s.url}
                onChange={(e) => {
                  const next = [...social];
                  next[i] = { ...next[i], url: e.target.value };
                  update('menu_footer', { ...menuFooter, social: next });
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => {
                  const next = social.filter((_, idx) => idx !== i);
                  update('menu_footer', { ...menuFooter, social: next });
                }}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() =>
            update('menu_footer', { ...menuFooter, social: [...social, { platform: '', url: '' }] })
          }>
            + Add Social
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Footer Columns</label>
          {columns.map((col, ci) => (
            <div key={ci} className="border border-border rounded p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold">Column {ci + 1}</span>
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive h-8"
                  onClick={() => {
                    const next = columns.filter((_, idx) => idx !== ci);
                    update('menu_footer', { ...menuFooter, columns: next });
                  }}
                >
                  ✕
                </Button>
              </div>
              {col.items.map((item, ii) => (
                <div key={ii} className="flex gap-2 mb-1">
                  <Input
                    placeholder="Label"
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive h-8"
                    onClick={() => {
                      const next = [...columns];
                      next[ci].items = next[ci].items.filter((_, idx) => idx !== ii);
                      update('menu_footer', { ...menuFooter, columns: next });
                    }}
                  >
                    ✕
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="mt-1" onClick={() => {
                const next = [...columns];
                next[ci].items = [...next[ci].items, { label: '', url: '' }];
                update('menu_footer', { ...menuFooter, columns: next });
              }}>
                + Add Item
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() =>
            update('menu_footer', { ...menuFooter, columns: [...columns, { title: '', items: [{ label: '', url: '' }] }] })
          }>
            + Add Column
          </Button>
        </div>
      </div>
    );
  }

  function renderSeo() {
    const seo = settings.seo || {};
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Meta Title</label>
          <Input
            value={seo.meta_title || ''}
            onChange={(e) => update('seo', { ...seo, meta_title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Meta Description</label>
          <Textarea
            rows={3}
            value={seo.meta_description || ''}
            onChange={(e) => update('seo', { ...seo, meta_description: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Keywords (comma separated)</label>
          <Input
            value={seo.keywords || ''}
            onChange={(e) => update('seo', { ...seo, keywords: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">OG Image</label>
          <div className="flex items-center gap-3">
            {seo.og_image && (
              <img src={seo.og_image} alt="OG" className="h-16 w-auto object-contain border border-border rounded" />
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => handleImageUpload('og_image')}>
              Upload OG Image
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sitemap URL</label>
          <Input
            value={seo.sitemap || ''}
            onChange={(e) => update('seo', { ...seo, sitemap: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Robots.txt Content</label>
          <Textarea
            className="font-mono text-xs"
            rows={6}
            value={seo.robots_txt || ''}
            onChange={(e) => update('seo', { ...seo, robots_txt: e.target.value })}
          />
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="flex gap-1 flex-wrap mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {tab}
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
