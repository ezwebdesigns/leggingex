import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const CATEGORIES = ['Women', 'Men', 'Kids', 'Sports', 'Plus Size', 'Fashion'];

const EMPTY_FORM = {
  name: '', brand: '', category: 'Women', image_url: '', price: '', rating: '', reviews_count: '',
  best_seller_rank: '', affiliate_url: '', affiliate_site: 'Amazon', description: '', material: '', status: 'active', is_featured: false,
};

export default function ProductForm({ initial = EMPTY_FORM, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      rating: form.rating ? parseFloat(form.rating) : null,
      reviews_count: form.reviews_count ? parseInt(form.reviews_count) : null,
      best_seller_rank: form.best_seller_rank ? parseInt(form.best_seller_rank) : null,
    };
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product Name *</Label>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} required className="mt-1 rounded-xl" placeholder="e.g. High Waisted Yoga Leggings" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Brand *</Label>
          <Input value={form.brand} onChange={(e) => set('brand', e.target.value)} required className="mt-1 rounded-xl" placeholder="e.g. Adidas, Nike..." />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category *</Label>
          <Select value={form.category} onValueChange={(v) => set('category', v)}>
            <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl">
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Image URL</Label>
          <Input value={form.image_url} onChange={(e) => set('image_url', e.target.value)} className="mt-1 rounded-xl" placeholder="https://..." type="url" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Indicative Price</Label>
          <Input value={form.price} onChange={(e) => set('price', e.target.value)} className="mt-1 rounded-xl" placeholder="29.99" type="number" step="0.01" min="0" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rating (0–5)</Label>
          <Input value={form.rating} onChange={(e) => set('rating', e.target.value)} className="mt-1 rounded-xl" placeholder="4.5" type="number" step="0.1" min="0" max="5" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reviews Count</Label>
          <Input value={form.reviews_count} onChange={(e) => set('reviews_count', e.target.value)} className="mt-1 rounded-xl" placeholder="1247" type="number" min="0" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Best Seller Rank</Label>
          <Input value={form.best_seller_rank} onChange={(e) => set('best_seller_rank', e.target.value)} className="mt-1 rounded-xl" placeholder="42" type="number" min="1" />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Affiliate Link *</Label>
          <Input value={form.affiliate_url} onChange={(e) => set('affiliate_url', e.target.value)} required className="mt-1 rounded-xl" placeholder="https://amazon.com/..." type="url" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Affiliate Site</Label>
          <Input value={form.affiliate_site} onChange={(e) => set('affiliate_site', e.target.value)} className="mt-1 rounded-xl" placeholder="Amazon" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Material</Label>
          <Input value={form.material} onChange={(e) => set('material', e.target.value)} className="mt-1 rounded-xl" placeholder="92% Polyester, 8% Spandex" />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</Label>
          <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} className="mt-1 rounded-xl resize-none" rows={3} placeholder="Product description..." />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</Label>
          <Select value={form.status} onValueChange={(v) => set('status', v)}>
            <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl">
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="flex-1 rounded-xl">
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
