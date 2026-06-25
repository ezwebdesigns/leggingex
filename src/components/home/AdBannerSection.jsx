import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function AdBannerSection({ banners }) {
  if (!banners || banners.length === 0) return null;
  return (
    <section className="px-4 md:px-6 mb-10 space-y-4">
      {banners.map((banner) => (
        <AdBanner key={banner.id} banner={banner} />
      ))}
    </section>
  );
}

function AdBanner({ banner }) {
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