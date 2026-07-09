export default function BrandLogoRow({ brands, title, description }) {
  if (!brands || brands.length === 0) return null;

  return (
    <section className="mb-10">
      {title && (
        <h2 className="text-base md:text-lg font-bold text-foreground mb-1 px-4 lg:px-14">{title}</h2>
      )}
      {description && (
        <p className="text-sm text-muted-foreground mb-4 px-4 lg:px-14">{description}</p>
      )}
      <div className="px-4 lg:px-14">
        <div className="flex flex-wrap items-center justify-center">
          {brands.map((brand, idx) => {
            const img = (
              <img
                src={brand.logo_url}
                alt={brand.name}
                className="h-8 sm:h-10 md:h-12 w-auto opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
              />
            );
            return (
              <div
                key={brand.id}
                className={`flex items-center py-2 px-6 sm:px-8 md:px-10 ${idx < brands.length - 1 ? 'border-r border-border' : ''}`}
              >
                {brand.link ? (
                  <a href={brand.link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    {img}
                  </a>
                ) : (
                  <div className="flex items-center">{img}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
