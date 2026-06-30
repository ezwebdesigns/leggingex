import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ScrollableRow({ children, className = '' }) {
  const ref = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      setShowLeft(el.scrollLeft > 4);
      setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    };
    check();
    el.addEventListener('scroll', check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', check);
      ro.disconnect();
    };
  }, []);

  const scroll = (dir) => {
    ref.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  return (
    <div className={`relative group ${className}`}>
      {showLeft && (
        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      <div ref={ref} className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2">
          {children}
        </div>
      </div>
      {showRight && (
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
