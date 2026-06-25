import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import MiniProductCard from '@/components/products/MiniProductCard';

export default function FeaturedSectionRow({ sections }) {
  if (!sections || sections.length === 0) return null;

  return (
    <section className="px-4 md:px-6 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <div key={section.id} className="rounded-2xl border border-border bg-card p-4 md:p-5 h-[420px] overflow-hidden flex flex-col">
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
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base md:text-lg font-bold text-foreground">{section.title}</h3>
        <Link to={viewAllLink} className="flex items-center gap-1 text-xs text-primary font-medium hover:underline whitespace-nowrap">
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {products.length > 0 ? (
        <div className="flex gap-3">
          {products.slice(0, 3).map((p) => (
            <MiniProductCard key={p.id} product={p} compact />
          ))}
        </div>
      ) : (
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-1 animate-pulse">
              <div className="aspect-[3/4] bg-muted rounded-2xl" />
              <div className="h-3 bg-muted rounded mt-2 w-3/4" />
              <div className="h-3 bg-muted rounded mt-1 w-1/2" />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function FeaturedBanner({ section }) {
  const hasImage = section.image_url;
  const hasScript = section.script_content;

  if (!hasImage && !hasScript) return null;

  return (
    <div className="flex items-center justify-center h-full overflow-hidden rounded-xl">
      {hasScript ? (
        <div className="w-full max-w-[970px]" dangerouslySetInnerHTML={{ __html: section.script_content }} />
      ) : (
        <a href={section.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
          <img src={section.image_url} alt={section.title} className="w-full h-full object-cover" />
        </a>
      )}
    </div>
  );
}

function FeaturedText({ section }) {
  if (!section.content) return null;

  return (
    <>
      <h3 className="text-base md:text-lg font-bold text-foreground mb-3">{section.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed text-justify whitespace-pre-line">
        {section.content}
      </p>
    </>
  );
}
