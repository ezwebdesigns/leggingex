import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Instagram, Twitter, Youtube } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function Footer() {
  const [staticPages, setStaticPages] = useState([]);

  useEffect(() => {
    supabase.from('pages').select('*').eq('type', 'static_page').eq('published', true)
      .then(({ data }) => setStaticPages(data || []))
      .catch(() => {});
  }, []);

  return (
    <footer className="border-t border-border bg-background mt-16">
      <div className="w-full px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2} />
              </div>
              <span className="text-base font-bold tracking-tight">leggings</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover the best leggings, handpicked for you. Affiliate links to our partner stores.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {[
                ['Biker Shorts', '/catalogue?category=Biker+Shorts'],
                ['Yoga Pants', '/catalogue?category=Yoga+Pants'],
                ['High Waisted', '/catalogue?category=High+Waisted+Leggings'],
                ['Gym Shorts', '/catalogue?category=Gym+Shorts'],
                ['Plus Size', '/catalogue?category=Plus+Size+Leggings'],
                ['Fashion', '/catalogue?category=Fashion+Leggings'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Styles</h4>
            <ul className="space-y-2.5">
              {[
                ['High Waisted', '/catalogue?category=High+Waisted+Leggings'],
                ['Fashion Leggings', '/catalogue?category=Fashion+Leggings'],
                ['Workout Leggings', '/catalogue?category=Workout+Leggings'],
                ['Leather Leggings', '/catalogue?category=Leather+Leggings'],
                ['Cycling Shorts', '/catalogue?category=Cycling+Shorts'],
                ['Booty Shorts', '/catalogue?category=Booty+Shorts'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

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
            © {new Date().getFullYear()} Leggings. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            This site contains affiliate links. We earn a commission on qualifying purchases.
          </p>
        </div>
      </div>
    </footer>
  );
}