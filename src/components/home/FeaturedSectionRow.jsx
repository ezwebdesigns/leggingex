import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import MiniProductCard from '@/components/products/MiniProductCard';

export default function FeaturedSectionRow({ sections }) {
  if (!sections || sections.length === 0) return null;

  return (
    <section className="px-4 md:px-6 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className="rounded-2xl border border-border bg-card p-4 md:p-5 h-[340px] overflow-hidden"
          >
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
        <h3 className="text-sm md:text-base font-bold text-foreground truncate">{section.title}</h3>
        <Link to={viewAllLink} className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0 ml-2">
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {products.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {products.slice(0, 4).map((p) => (
            <MiniProductCard key={p.id} product={p} compact />
          ))}
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[120px] animate-pulse flex-shrink-0">
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
    <div className="h-full flex">
      {hasScript ? (
        <div className="w-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: section.script_content }} />
      ) : (
        <a href={section.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full">
          <img src={section.image_url} alt={section.title} className="w-full h-full object-cover rounded-xl" />
        </a>
      )}
    </div>
  );
}

function FeaturedText({ section }) {
  if (!section.content) return null;

  return (
    <>
      <h3 className="text-sm md:text-base font-bold text-foreground mb-3">{section.title}</h3>
      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed text-justify whitespace-pre-line line-clamp-[10]">
        {section.content}
      </p>
    </>
  );
}
