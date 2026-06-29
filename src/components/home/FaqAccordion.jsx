import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

function AccordionGroup({ title, items }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!items || items.length === 0) return null;

  return (
    <div>
      {title && <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">{title}</h3>}
      <div className="space-y-2">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FaqAccordion({ columns }) {
  if (!columns || columns.length === 0) return null;

  return (
    <section className="px-14 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {columns.map((col, i) => (
          <AccordionGroup key={i} title={col.title} items={col.items} />
        ))}
      </div>
    </section>
  );
}
