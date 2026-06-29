import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

function AccordionColumn({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!items || items.length === 0) return null;

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 py-4 text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <span>{item.q}</span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && item.a && (
              <div className="pb-4 text-sm text-muted-foreground leading-relaxed">
                {item.a}
              </div>
            )}
            {i < items.length - 1 && <div className="border-b border-border" />}
          </div>
        );
      })}
    </div>
  );
}

export default function FaqAccordion({ columns }) {
  if (!columns || columns.length === 0) return null;

  return (
    <section className="px-14 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
        {columns.map((col, i) => (
          <AccordionColumn key={i} items={col.items} />
        ))}
      </div>
    </section>
  );
}
