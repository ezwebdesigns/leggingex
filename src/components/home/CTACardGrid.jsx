export default function CTACardGrid({ cards, title = "Shop by Category" }) {
  if (!cards || cards.length === 0) return null;
  return (
    <section className="px-4 md:px-6 mb-10">
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {cards.map((card) => (
          <a key={card.id} href={card.link} target="_blank" rel="noopener noreferrer" className="group block">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {card.bg_color && !card.image_url ? (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: card.bg_color }}>
                  <span className="font-medium text-center px-2 text-sm" style={{ color: card.text_color || '#ffffff' }}>{card.title}</span>
                </div>
              ) : card.image_url ? (
                <img src={card.image_url} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              ) : (
                <div className="w-full h-full bg-secondary" />
              )}
            </div>
            <p className="text-sm text-foreground mt-2 underline underline-offset-2 group-hover:text-primary transition-colors">{card.title}</p>
          </a>
        ))}
      </div>
    </section>
  );
}