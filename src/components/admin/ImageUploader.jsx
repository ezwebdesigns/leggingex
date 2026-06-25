import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImageUploader({ value, onChange, folder = 'images', label = 'Image' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const ext = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from('admin-uploads')
      .upload(path, file, { contentType: file.type, upsert: false });

    if (!error) {
      const { data } = supabase.storage.from('admin-uploads').getPublicUrl(path);
      setPreview(data.publicUrl);
      onChange(data.publicUrl);
    } else {
      console.error(error);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" id={`img-upload-${folder}`} />

      {preview ? (
        <div className="relative group w-full h-40 rounded-xl border border-border overflow-hidden bg-muted">
          <img src={preview} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload className="w-3.5 h-3.5 mr-1" /> Replace
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={handleRemove}>
              <X className="w-3.5 h-3.5 mr-1" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={`img-upload-${folder}`}
          className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 cursor-pointer transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin mb-2" />
          ) : (
            <ImageIcon className="w-6 h-6 text-muted-foreground mb-2" />
          )}
          <p className="text-xs text-muted-foreground">{uploading ? 'Uploading...' : 'Click to upload'}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">JPG, PNG, WebP (max 5 MB)</p>
        </label>
      )}
    </div>
  );
}
