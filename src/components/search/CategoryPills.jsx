import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export default function CategoryPills({ activeCategory = '', onSelect, basePath = '/categories' }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    supabase.from('category_tags').select('*').eq('is_active', true).order('sort_order').limit(50)
      .then(({ data }) => setCategories(data || []))
      .catch(() => {});
  }, []);

  const pills = [{ label: 'All', value: '', image_url: null }, ...categories.map((c) => ({ label: c.label, value: c.value, image_url: c.image_url }))];

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 px-14">
      {pills.map(({ label, value, image_url }) => {
        const active = activeCategory === value;

        if (onSelect) {
          return (
            <button
              key={value || 'all'}
              onClick={() => onSelect(value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 inline-flex items-center gap-1.5 ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'bg-secondary text-foreground hover:bg-muted border border-border/50'
              }`}
            >
              {image_url && <img src={image_url} alt="" className="w-5 h-5 rounded-full object-cover" />}
              {label}
            </button>
          );
        }

        return (
          <Link
            key={value || 'all'}
            to={value ? `${basePath}?cat=${encodeURIComponent(value)}` : basePath}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 inline-flex items-center gap-1.5 ${
              active
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'bg-secondary text-foreground hover:bg-muted border border-border/50'
            }`}
          >
            {image_url && <img src={image_url} alt="" className="w-5 h-5 rounded-full object-cover" />}
            {label}
          </Link>
        );
      })}
    </div>
  );
}
