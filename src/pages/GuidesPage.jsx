import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { getSettings } from '@/lib/settings';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import PageNotFound from '@/lib/PageNotFound';

function ArticleSidebar({ post, recentPosts, adScript }) {
  const keywords = post.keywords || [];
  return (
    <aside className="space-y-6">
      {adScript && (
        <div className="bg-muted/30 border border-border rounded-2xl overflow-hidden p-4 text-center text-xs text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: adScript }} />
      )}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-bold text-foreground text-sm mb-4 uppercase tracking-wider">Latest Articles</h3>
        <div className="space-y-4">
          {recentPosts.length === 0 ? (
            <p className="text-xs text-muted-foreground">No other articles yet.</p>
          ) : recentPosts.map((rp) => (
            <Link key={rp.id} to={`/guides/${rp.slug}`} className="flex items-start gap-3 group">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
                {rp.cover_image ? (
                  <img src={rp.cover_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">📝</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary line-clamp-2 transition-colors">
                  {rp.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {rp.published_at ? new Date(rp.published_at).toLocaleDateString('en-US') : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {keywords.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-foreground text-sm mb-4 uppercase tracking-wider">Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, i) => (
              <span key={i} className="text-xs bg-secondary text-muted-foreground px-3 py-1.5 rounded-full">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

export default function GuidesPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adScript, setAdScript] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: results } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', slug)
          .eq('type', 'blog_post')
          .eq('published', true);
        const found = results && results.length > 0 ? results[0] : null;
        setPost(found);

        if (found) {
          const { data: recent } = await supabase
            .from('pages')
            .select('id, title, slug, cover_image, published_at')
            .eq('type', 'blog_post')
            .eq('published', true)
            .neq('id', found.id)
            .order('published_at', { ascending: false })
            .limit(3);
          setRecentPosts(recent || []);
        }

        const settings = await getSettings();
        setAdScript(settings?.sidebar?.ad_script || '');
      } catch {
        setPost(null);
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

  if (!post) {
    return <PageNotFound />;
  }

  const keywords = post.keywords || [];
  const faq = post.faq || [];
  const pageTitle = post.seo_title || post.title;
  const pageDesc = post.meta_description || post.excerpt || '';

  return (
    <div className="min-h-screen bg-background">
      <div className="px-14 py-8">
        <Link to="/guides" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Guides
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <article>
            {post.cover_image && (
              <div className="rounded-2xl overflow-hidden mb-6 aspect-[2/1]">
                <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
              {post.category && (
                <span className="px-2 py-0.5 rounded-full bg-secondary font-medium">{post.category}</span>
              )}
              {post.published_at && (
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(post.published_at).toLocaleDateString('en-US')}</span>
              )}
              {post.author && (
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{post.title}</h1>

            {post.excerpt && (
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{post.excerpt}</p>
            )}

            <div className="prose prose-sm max-w-none text-foreground [&_img]:rounded-xl [&_table]:w-full [&_table]:border-collapse [&_th]:bg-muted [&_th]:p-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_td]:p-2 [&_td]:border [&_td]:border-border [&_tr]:border-border [&_a]:text-primary [&_a]:underline [&_ul]:pl-4 [&_ol]:pl-4" dangerouslySetInnerHTML={{ __html: post.content || '' }} />

            {faq.length > 0 && (
              <div className="mt-10 border border-border rounded-2xl p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faq.map((item, i) => (
                    <div key={i}>
                      <h3 className="font-semibold text-foreground text-sm mb-1">{item.question}</h3>
                      <p className="text-sm text-muted-foreground">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {post.cta_title && (
              <div className="mt-6 bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
                <h3 className="text-lg font-bold text-foreground mb-2">{post.cta_title}</h3>
                {post.cta_button && post.cta_link && (
                  <a href={post.cta_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                    {post.cta_button}
                  </a>
                )}
              </div>
            )}
          </article>

          <ArticleSidebar post={post} recentPosts={recentPosts} adScript={adScript} />
        </div>
      </div>
    </div>
  );
}
