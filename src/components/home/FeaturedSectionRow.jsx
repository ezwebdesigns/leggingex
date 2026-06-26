import { Link } from 'react-router-dom';

import MiniProductCard from '@/components/products/MiniProductCard';

export default function FeaturedSectionRow({ sections }) {
  if (!sections || sections.length === 0) return null;

  return (
    <section className="px-4 md:px-6 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className="rounded-2xl border border-border bg-card p-4 md:p-5 h-[340px] flex flex-col justify-between overflow-hidden"
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
    <div className="flex flex-col h-full w-full justify-between overflow-hidden">
      {/* En-tête de la section */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <h3 className="text-sm md:text-base font-bold text-foreground truncate">{section.title}</h3>
        <Link to={viewAllLink} className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0 ml-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Grid d'affichage occupant l'exact espace restant */}
      <div className="flex-1 min-h-0 w-full">
        {products.length > 0 ? (
          <div className="grid grid-cols-4 gap-2 h-full w-full">
            {products.slice(0, 4).map((p) => (
              <div key={p.id} className="h-full min-w-0">
                {/* Passage de la propriété featured={true} pour adapter le dimensionnement */}
                <MiniProductCard product={p} featured={true} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 h-full w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-full min-w-0 rounded-xl border border-border animate-pulse flex flex-col">
                <div className="flex-1 bg-muted rounded-t-xl" />
                <div className="p-2 space-y-1.5 shrink-0">
                  <div className="h-2 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturedBanner({ section }) {
  const hasImage = section.image_url;
  const hasScript = section.script_content;

  if (!hasImage && !hasScript) return null;

  return (
    <div className="h-full w-full relative rounded-2xl overflow-hidden">
      {hasScript ? (
        <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: section.script_content }} />
      ) : (
        <>
          <img src={section.image_url} alt={section.title} className="w-full h-full object-cover" />
          {(section.title || section.subtitle) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          )}
          {(section.title || section.subtitle) && (
            <div className="absolute bottom-0 left-0 p-4">
              {section.title && <p className="text-white font-bold text-sm md:text-base">{section.title}</p>}
              {section.subtitle && <p className="text-white/80 text-xs mt-0.5">{section.subtitle}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FeaturedText({ section }) {
  if (!section.content) return null;

  return (
    <div className="flex flex-col h-full justify-start overflow-hidden">
      <h3 className="text-sm md:text-base font-bold text-foreground mb-3 shrink-0">{section.title}</h3>
      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed text-justify whitespace-pre-line line-clamp-[11] overflow-hidden">
        {section.content}
      </p>
    </div>
  );
}