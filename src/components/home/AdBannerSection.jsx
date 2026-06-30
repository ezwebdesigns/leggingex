import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function AdBannerSection({ banners }) {
  if (!banners || banners.length === 0) return null;

  const fullBanners = banners.filter((b) => !b.display_type || b.display_type === 'full');
  const simpleBanners = banners.filter((b) => b.display_type === 'simple');
  const squareBanners = banners.filter((b) => b.display_type === 'square');

  return (
    <section className="px-4 lg:px-14 mb-10 space-y-4">
      {fullBanners.map((banner) => (
        <FullBanner key={banner.id} banner={banner} />
      ))}
      {simpleBanners.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {simpleBanners.map((banner) => (
            <SimpleBanner key={banner.id} banner={banner} />
          ))}
        </div>
      )}
      {squareBanners.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {squareBanners.map((banner) => (
            <SquareBanner key={banner.id} banner={banner} />
          ))}
        </div>
      )}
      {!banners.some((b) => b.type === 'script') && banners.some((b) => b.display_type === 'simple' || b.display_type === 'square') && (
        <p className="text-center text-xs text-muted-foreground mt-2">Sponsored</p>
      )}
    </section>
  );
}

function FullBanner({ banner }) {
  const ref = useRef(null);

  useEffect(() => {
    if (banner.type === 'script' && banner.script_content && ref.current) {
      ref.current.innerHTML = banner.script_content;
      const scripts = ref.current.querySelectorAll('script');
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }
  }, [banner]);

  if (banner.type === 'script') {
    return <div ref={ref} className="w-full min-h-[200px] rounded-2xl overflow-hidden bg-muted" />;
  }

  const isInternal = banner.link && banner.link.startsWith('/');
  const linkProps = isInternal
    ? { to: banner.link }
    : { href: banner.link, target: '_blank', rel: 'noopener noreferrer' };
  const LinkComp = isInternal ? Link : 'a';

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col sm:flex-row">
      {banner.image_url && (
        <div className="sm:w-2/5 aspect-[4/3] sm:aspect-auto">
          <img src={banner.image_url} alt={banner.title || ''} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="sm:w-3/5 flex flex-col items-center justify-center text-center p-6 md:p-10" style={{ backgroundColor: banner.bg_color || '#000000' }}>
        {banner.title && <h3 className="text-white font-bold text-lg md:text-xl uppercase mb-2">{banner.title}</h3>}
        {banner.subtitle && <p className="text-white/80 text-sm mb-4">{banner.subtitle}</p>}
        {banner.button_text && banner.link && (
          <LinkComp {...linkProps} className="text-white text-sm underline underline-offset-4 hover:text-white/80 transition-colors">
            {banner.button_text}
          </LinkComp>
        )}
        <p className="text-white/40 text-xs mt-4">Sponsored</p>
      </div>
    </div>
  );
}

function SimpleBanner({ banner }) {
  const isInternal = banner.link && banner.link.startsWith('/');
  const linkProps = isInternal
    ? { to: banner.link }
    : { href: banner.link, target: '_blank', rel: 'noopener noreferrer' };
  const LinkComp = isInternal ? Link : 'a';
  const content = (
    <>
      <img src={banner.image_url} alt={banner.title || ''} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 p-4 md:p-6">
        {banner.title && <h3 className="text-white font-bold text-lg md:text-xl">{banner.title}</h3>}
        {banner.subtitle && <p className="text-white/80 text-sm mt-1">{banner.subtitle}</p>}
      </div>
    </>
  );
  return banner.link ? (
    <LinkComp {...linkProps} className="relative block h-32 sm:h-36 md:h-40 rounded-2xl overflow-hidden group">
      {content}
    </LinkComp>
  ) : (
    <div className="relative h-32 sm:h-36 md:h-40 rounded-2xl overflow-hidden">{content}</div>
  );
}

function SquareBanner({ banner }) {
  return (
    <a href={banner.link} target="_blank" rel="noopener noreferrer" className="group block">
      <div className="aspect-square rounded-2xl overflow-hidden bg-muted relative">
        {banner.image_url ? (
          <img src={banner.image_url} alt={banner.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {banner.title && (
          <div className="absolute bottom-0 left-0 p-3">
            <p className="text-white font-semibold text-sm">{banner.title}</p>
          </div>
        )}
      </div>
    </a>
  );
}
