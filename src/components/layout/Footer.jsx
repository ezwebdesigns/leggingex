import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Instagram, Twitter, Youtube } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getSettings } from '@/lib/settings';

const SOCIAL_ICONS = { Instagram, Twitter, Youtube };

export default function Footer() {
  const [staticPages, setStaticPages] = useState([]);
  const [menuFooter, setMenuFooter] = useState(null);
  const [general, setGeneral] = useState(null);

  useEffect(() => {
    Promise.all([
      supabase.from('pages').select('*').eq('type', 'static_page').eq('published', true),
      getSettings(),
    ]).then(([{ data }, settings]) => {
      setStaticPages(data || []);
      setMenuFooter(settings.menu_footer || null);
      setGeneral(settings.general || null);
    }).catch(() => {});
  }, []);

  const logo = general?.logo;
  const siteTitle = general?.site_title || 'leggings';
  const logoText = menuFooter?.logo_text || siteTitle;
  const description = menuFooter?.description || 'Discover the best leggings, handpicked for you.';
  const social = menuFooter?.social || [];
  const columns = menuFooter?.columns || [];

  return (
    <footer className="border-t border-border bg-background mt-16">
      <div className="w-full px-14 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              {logo ? (
                <img src={logo} alt={logoText} className="h-7 w-auto" />
              ) : (
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2} />
                </div>
              )}
              {!logo && <span className="text-base font-bold tracking-tight">{logoText}</span>}
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            {social.length > 0 && (
              <div className="flex items-center gap-3 mt-4">
                {social.map((s, i) => {
                  const LucideIcon = SOCIAL_ICONS[s.platform];
                  return (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      {LucideIcon ? <LucideIcon className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 text-xs font-bold">{s.platform[0]}</span>}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {columns.map((col, ci) => (
            <div key={ci}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {(col.items || []).map((item, ii) => (
                  <li key={ii}>
                    <Link to={item.url} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Information</h4>
            <ul className="space-y-2.5">
              {staticPages.map((page) => (
                <li key={page.id}>
                  <Link to={`/${page.slug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{page.title}</Link>
                </li>
              ))}
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteTitle}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            This site contains affiliate links. We earn a commission on qualifying purchases.
          </p>
        </div>
      </div>
    </footer>
  );
}
