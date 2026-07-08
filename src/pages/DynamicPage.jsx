import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { getSettings } from '@/lib/settings';
import { ArrowLeft, Calendar, User, ChevronDown } from 'lucide-react';
import PageNotFound from '@/lib/PageNotFound';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAuth } from '@/lib/AuthContext';
import { renderContent } from '@/utils/renderContent';

function FaqAccordionItem({ question, answer, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div className="px-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 py-4 text-left"
      >
        <span className="font-semibold text-foreground text-sm">{question}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-4 -mt-1">
          <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

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
            <Link key={rp.id} to={`/${rp.slug}`} className="flex items-start gap-3 group">
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

export default function DynamicPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  const isPreview = searchParams.get('preview') === 'true' && isAdmin;
  const [page, setPage] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adScript, setAdScript] = useState('');

  usePageMeta({
    title: page ? `${page.title} | Legging Express` : undefined,
    description: page?.excerpt || undefined,
    ogImage: page?.cover_image || undefined,
    canonical: slug ? `/${slug}` : undefined,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let query = supabase.from('pages').select('*').eq('slug', slug);
        if (!isPreview) query = query.eq('published', true);
        const { data: results } = await query;
        const found = results && results.length > 0 ? results[0] : null;
        setPage(found);

        if (found && found.type === 'blog_post') {
          let recentQuery = supabase
            .from('pages')
            .select('id, title, slug, cover_image, published_at')
            .eq('type', 'blog_post')
            .neq('id', found.id)
            .order('published_at', { ascending: false })
            .limit(3);
          if (!isPreview) recentQuery = recentQuery.eq('published', true);
          const { data: recent } = await recentQuery;
          setRecentPosts(recent || []);
        }

        const settings = await getSettings();
        setAdScript(settings?.sidebar?.ad_script || '');
      } catch {
        setPage(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, isPreview]);

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

  const faq = page.faq || [];

  if (page.type === 'blog_post') {
    return (
      <div className="min-h-screen bg-background">
        {isPreview && (
          <div className="bg-amber-500 text-white text-center text-sm font-medium py-2 px-4">
            Preview Mode — This article is not published
          </div>
        )}
        <div className="px-4 lg:px-14 py-8">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            <article>
              {page.cover_image && (
                <div className="rounded-2xl overflow-hidden mb-6 aspect-[2/1]">
                  <img src={page.cover_image} alt={page.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                {page.category && (
                  <span className="px-2 py-0.5 rounded-full bg-secondary font-medium">{page.category}</span>
                )}
                {page.published_at && (
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(page.published_at).toLocaleDateString('en-US')}</span>
                )}
                {page.author && (
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{page.author}</span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{page.title}</h1>

              {page.excerpt && (
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{page.excerpt}</p>
              )}

              <div className="prose prose-sm max-w-none text-foreground">{renderContent(page.content)}</div>

              {faq.length > 0 && (
                <div className="mt-10 border border-border rounded-2xl overflow-hidden">
                  <h2 className="text-lg font-bold text-foreground px-6 pt-6 pb-2">Frequently Asked Questions</h2>
                  <div className="divide-y divide-border">
                    {faq.map((item, i) => (
                      <FaqAccordionItem key={i} question={item.question} answer={item.answer} defaultOpen={i === 0} />
                    ))}
                  </div>
                </div>
              )}

              {page.cta_title && (
                <div className="mt-6 bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
                  <h3 className="text-lg font-bold text-foreground mb-2">{page.cta_title}</h3>
                  {page.cta_button && page.cta_link && (
                    <a href={page.cta_link} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                      {page.cta_button}
                    </a>
                  )}
                </div>
              )}
            </article>

            <ArticleSidebar post={page} recentPosts={recentPosts} adScript={adScript} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isPreview && (
        <div className="bg-amber-500 text-white text-center text-sm font-medium py-2 px-4">
          Preview Mode — This page is not published
        </div>
      )}
      <div className="max-w-3xl mx-auto px-4 lg:px-14 py-8">
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
        <div className="prose prose-sm max-w-none text-foreground">{renderContent(page.content)}</div>
      </div>
    </div>
  );
}
