import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import MiniProductCard from '@/components/products/MiniProductCard';

export default function FeaturedSectionRow({ sections }) {
  if (!sections || sections.length === 0) return null;

  return (
    <section className="px-4 md:px-6 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <FeaturedSection key={section.id} section={section} />
        ))}
      </div>
    </section>
  );
}

function FeaturedSection({ section }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const viewAllLink = section.category
    ? `/catalogue?category=${encodeURIComponent(section.category)}`
    : '/catalogue';

  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-bold text-foreground">{section.title}</h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <Link
            to={viewAllLink}
            className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors ml-1"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
      >
        {section._products && section._products.length > 0 ? (
          section._products.map((p) => (
            <MiniProductCard key={p.id} product={p} />
          ))
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-36 sm:w-44 animate-pulse">
              <div className="aspect-[3/4] bg-muted rounded-2xl" />
              <div className="h-3 bg-muted rounded mt-2 w-3/4" />
              <div className="h-3 bg-muted rounded mt-1 w-1/2" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
