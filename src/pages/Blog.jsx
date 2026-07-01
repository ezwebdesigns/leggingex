import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Calendar } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function Blog() {
  usePageMeta({
    title: 'Blog — Leggings tips, guides and trends | Legging Express',
    description: 'Tips, guides, and leggings trends — read the latest articles from Legging Express.',
  });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('pages').select('*').eq('type', 'blog_post').eq('published', true).order('published_at', { ascending: false }).limit(50)
      .then(({ data }) => { setPosts(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 lg:px-14 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Blog</h1>
        <p className="text-muted-foreground mb-8">Tips, guides, and leggings trends</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[2/1] bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">📝</span>
            <p className="text-lg font-medium text-muted-foreground">No articles yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} to={`/${post.slug}`} className="group block rounded-2xl overflow-hidden bg-card border border-border/50 hover:shadow-md transition-all duration-300">
                {post.cover_image && (
                  <div className="aspect-[2/1] bg-muted overflow-hidden">
                    <img src={post.cover_image} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  {post.published_at && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.published_at).toLocaleDateString('en-US')}
                    </p>
                  )}
                  <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{post.title}</h2>
                  {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}