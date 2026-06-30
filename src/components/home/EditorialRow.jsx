import { Link } from 'react-router-dom';

export default function EditorialRow({ cards, title = "New & Now", description }) {
  if (!cards || cards.length === 0) return null;
  return (
    <section className="px-4 lg:px-14 mb-10">
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="group">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-3">
              {card.image_url && (
                <img src={card.image_url} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              )}
            </div>
            <h3 className="font-bold text-foreground mb-1">{card.title}</h3>
            {card.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{card.description}</p>}
            <div className="flex items-center gap-3 flex-wrap">
              {card.button_text && card.button_link && (
                <Link to={card.button_link} className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
                  {card.button_text}
                </Link>
              )}
              {card.secondary_text && card.secondary_link && (
                <Link to={card.secondary_link} className="text-sm text-foreground underline underline-offset-2 hover:text-primary transition-colors">
                  {card.secondary_text}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}