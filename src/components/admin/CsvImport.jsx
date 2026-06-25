import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORIES = ['Women', 'Men', 'Kids', 'Sports', 'Plus Size', 'Fashion'];

function parseCSV(text) {
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  });
}

export default function CsvImport({ onImported }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target.result);
      setPreview(rows.slice(0, 5));
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const file = fileRef.current?.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      setImporting(true);
      const rows = parseCSV(ev.target.result);
      let success = 0, errors = 0;
      for (const row of rows) {
        try {
          if (!row.name || !row.affiliate_url) { errors++; continue; }
          await supabase.from('b44_products').insert({
            name: row.name,
            brand: row.brand || '',
            category: CATEGORIES.includes(row.category) ? row.category : 'Women',
            image_url: row.image_url || '',
            price: row.price ? parseFloat(row.price) : null,
            rating: row.rating ? parseFloat(row.rating) : null,
            reviews_count: row.reviews_count ? parseInt(row.reviews_count) : null,
            best_seller_rank: row.best_seller_rank ? parseInt(row.best_seller_rank) : null,
            affiliate_url: row.affiliate_url,
            affiliate_site: row.affiliate_site || 'Amazon',
            description: row.description || '',
            material: row.material || '',
            status: 'active',
          });
          success++;
        } catch { errors++; }
      }
      setImporting(false);
      setPreview(null);
      setResult({ success, errors });
      if (fileRef.current) fileRef.current.value = '';
      onImported();
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-foreground mb-6">Import products from CSV</h2>

      <div className="border border-border rounded-2xl p-5 bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary" />
          Bulk CSV Import
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Expected columns: name, brand, category, image_url, price, rating, reviews_count, best_seller_rank, affiliate_url, affiliate_site, description, material
        </p>

        <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" id="csv-input" />
        <label
          htmlFor="csv-input"
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-xl text-sm font-medium cursor-pointer hover:bg-muted transition-colors"
        >
          <Upload className="w-4 h-4" />
          Choose CSV file
        </label>

        {preview && (
          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Preview (first 5 rows):</p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="text-xs w-full">
                <thead className="bg-muted">
                  <tr>
                    {Object.keys(preview[0] || {}).slice(0, 6).map((k) => (
                      <th key={k} className="px-3 py-2 text-left font-medium text-muted-foreground">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {Object.values(row).slice(0, 6).map((v, j) => (
                        <td key={j} className="px-3 py-2 text-foreground truncate max-w-[100px]">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={handleImport} disabled={importing} className="mt-3 rounded-xl" size="sm">
              {importing ? 'Importing...' : 'Confirm Import'}
            </Button>
          </div>
        )}

        {result && (
          <div className={`mt-3 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${result.errors === 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            {result.errors === 0 ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {result.success} product{result.success !== 1 ? 's' : ''} imported
            {result.errors > 0 ? `, ${result.errors} error${result.errors !== 1 ? 's' : ''}` : ' successfully'}
          </div>
        )}
      </div>
    </div>
  );
}
