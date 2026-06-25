import { Link } from 'react-router-dom';
import MiniProductCard from '@/components/products/MiniProductCard';

export default function FeaturedSectionRow({ sections }) {
  if (!sections || sections.length === 0) return null;

  return (
    <section className="px-4 md:px-6 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <div key={section.id} className="rounded-2xl border border-border bg-card p-4 md:p-5 h-[380px]">
            {section.format === 'text' ? (
              <FeaturedText section={section} />
            ) : section.format === 'banner' ? (
              <FeaturedBanner section={section} />
            ) : (
              <FeaturedProduct section={section} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedProduct({ section }) {
  const products = section._products || [];
  const viewAllLink = section.category
    ? `/catalogue?category=${encodeURIComponent(section.category)}`
    : '/catalogue';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-base md:text-lg font-bold text-foreground">{section.title}</h3>
        <Link to={viewAllLink} className="flex items-center gap-1 text-xs text-primary font-medium hover:underline whitespace-nowrap">
          View all <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
      {products.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide min-h-0">
          {products.slice(0, 4).map((p) => (
            <MiniProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide min-h-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-36 sm:w-44 animate-pulse flex-shrink-0">
              <div className="aspect-[3/4] bg-muted rounded-2xl" />
              <div className="h-3 bg-muted rounded mt-2 w-3/4" />
              <div className="h-3 bg-muted rounded mt-1 w-1/2" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedBanner({ section }) {
  const hasImage = section.image_url;
  const hasScript = section.script_content;

  if (!hasImage && !hasScript) return null;

  return (
    <div className="h-full">
      {hasScript ? (
        <div className="w-full h-full max-w-[970px] flex items-center justify-center mx-auto" dangerouslySetInnerHTML={{ __html: section.script_content }} />
      ) : (
        <a href={section.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
          <img src={section.image_url} alt={section.title} className="w-full h-full object-cover rounded-xl" />
        </a>
      )}
    </div>
  );
}

function FeaturedText({ section }) {
  if (!section.content) return null;

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-base md:text-lg font-bold text-foreground mb-3 flex-shrink-0">{section.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed text-justify whitespace-pre-line min-h-0 overflow-y-auto">
        {section.content}
      </p>
    </div>
  );
}
