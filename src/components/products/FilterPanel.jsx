import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const CATEGORIES = ['Women', 'Men', 'Kids', 'Sports', 'Plus Size', 'Fashion'];
const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'best_seller_rank' },
  { label: 'Top Rated', value: '-rating' },
  { label: 'Most Reviews', value: '-reviews_count' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Newest', value: '-created_date' },
];

export default function FilterPanel({ filters, onFiltersChange, brands = [] }) {
  const [open, setOpen] = useState(false);

  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ category: '', brand: '', minRating: 0, sort: 'best_seller_rank' });
  };

  const activeCount = [filters.category, filters.brand, filters.minRating > 0].filter(Boolean).length;

  return (
    <div className="flex items-center gap-3 px-4 md:px-6">
      <Select value={filters.sort || 'best_seller_rank'} onValueChange={(v) => updateFilter('sort', v)}>
        <SelectTrigger className="w-44 rounded-xl text-sm border-border bg-background h-9">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="rounded-lg">{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-medium border transition-all duration-200 ${
          activeCount > 0 || open
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-background text-foreground border-border hover:border-border/80'
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={2} />
        Filters
        {activeCount > 0 && (
          <span className="bg-primary-foreground text-primary text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {activeCount > 0 && (
        <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md bg-background rounded-t-3xl md:rounded-2xl border border-border p-6 shadow-xl animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-5">
              <label className="text-sm font-medium text-foreground mb-3 block">Category</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateFilter('category', '')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${!filters.category ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-muted'}`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateFilter('category', cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filters.category === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-muted'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {brands.length > 0 && (
              <div className="mb-5">
                <label className="text-sm font-medium text-foreground mb-3 block">Brand</label>
                <Select value={filters.brand || ''} onValueChange={(v) => updateFilter('brand', v)}>
                  <SelectTrigger className="rounded-xl text-sm border-border">
                    <SelectValue placeholder="All brands" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value={null}>All brands</SelectItem>
                    {brands.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-1 block">
                Minimum Rating: {filters.minRating > 0 ? `${filters.minRating}★` : 'All'}
              </label>
              <Slider
                min={0}
                max={5}
                step={0.5}
                value={[filters.minRating || 0]}
                onValueChange={([v]) => updateFilter('minRating', v)}
                className="mt-3"
              />
            </div>

            <Button className="w-full rounded-xl" onClick={() => setOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}