import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import ScrollableRow from '@/components/ui/ScrollableRow';

export default function CategoryPills({ activeCategory = '', onSelect, basePath = '/categories' }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    supabase.from('category_tags').select('*').eq('is_active', true).order('sort_order').limit(50)
      .then(({ data }) => setCategories(data || []))
      .catch(() => {});
  }, []);

  const pills = [{ label: 'All', value: '', image_url: null }, ...categories.map((c) => ({ label: c.label, value: c.value, image_url: c.image_url }))];

  return (
    <ScrollableRow className="py-1">
      {pills.map(({ label, value, image_url }) => {
        const active = activeCategory === value;

        if (onSelect) {
          return (
            <button
              key={value || 'all'}
              onClick={() => onSelect(value)}
              style={{ backgroundColor: '#ffffff' }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 inline-flex items-center gap-1.5 ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'text-foreground hover:bg-gray-50 shadow-md border border-gray-100'
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
            style={{ backgroundColor: '#ffffff' }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 inline-flex items-center gap-1.5 ${
              active
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'text-foreground hover:bg-gray-50 shadow-md border border-gray-100'
            }`}
          >
            {image_url && <img src={image_url} alt="" className="w-5 h-5 rounded-full object-cover" />}
            {label}
          </Link>
        );
      })}
    </ScrollableRow>
  );
}
