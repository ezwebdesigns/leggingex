import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft } from 'lucide-react';
import PageNotFound from '@/lib/PageNotFound';

export default function DynamicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: results } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', slug)
          .eq('type', 'static_page')
          .eq('published', true);
        setPage(results && results.length > 0 ? results[0] : null);
      } catch {
        setPage(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!page) {
    return <PageNotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-14 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium mb-6">
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        {page.cover_image && (
          <div className="rounded-2xl overflow-hidden mb-6 aspect-[2/1]">
            <img src={page.cover_image} alt={page.title} className="w-full h-full object-cover" />
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{page.title}</h1>
        <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
      </div>
    </div>
  );
}
