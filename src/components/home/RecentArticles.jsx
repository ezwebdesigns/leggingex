import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export default function RecentArticles({ articles, title = "Recent Articles", description }) {
  if (!articles || articles.length === 0) return null;
  return (
    <section className="px-4 lg:px-14 mb-10">
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <Link key={article.id} to={`/${article.slug}`} className="group block rounded-2xl overflow-hidden bg-card border border-border/50 hover:shadow-md transition-all duration-300">
            {article.cover_image && (
              <div className="aspect-[2/1] overflow-hidden bg-muted">
                <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
            )}
            <div className="p-4 space-y-2">
              {article.published_at && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(article.published_at).toLocaleDateString('en-US')}
                </p>
              )}
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{article.title}</h3>
              {article.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}