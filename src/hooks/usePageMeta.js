import { useEffect, useRef } from 'react';

function qs(sel) {
  return document.querySelector(sel);
}

function meta(attr, key) {
  return qs(`meta[${attr}="${key}"]`);
}

export function usePageMeta({ title, description, ogImage, canonical } = {}) {
  const saved = useRef(null);

  useEffect(() => {
    if (!saved.current) {
      saved.current = {
        title: document.title,
        description: meta('name', 'description')?.content ?? '',
        ogTitle: meta('property', 'og:title')?.content ?? '',
        ogDescription: meta('property', 'og:description')?.content ?? '',
        ogImage: meta('property', 'og:image')?.content ?? '',
        ogUrl: meta('property', 'og:url')?.content ?? '',
        twTitle: meta('name', 'twitter:title')?.content ?? '',
        twDescription: meta('name', 'twitter:description')?.content ?? '',
        twImage: meta('name', 'twitter:image')?.content ?? '',
        canonical: qs('link[rel="canonical"]')?.href ?? '',
      };
    }

    if (title != null) document.title = title;
    setContent(meta('property', 'og:title'), title);
    setContent(meta('name', 'twitter:title'), title);
    setContent(meta('property', 'og:url'), canonical);
    const lnk = qs('link[rel="canonical"]');
    if (lnk && canonical != null) lnk.href = canonical;

    if (description) {
      setContent(meta('name', 'description'), description);
      setContent(meta('property', 'og:description'), description);
      setContent(meta('name', 'twitter:description'), description);
    }
    if (ogImage) {
      setContent(meta('property', 'og:image'), ogImage);
      setContent(meta('name', 'twitter:image'), ogImage);
    }

    return () => {
      const s = saved.current;
      if (!s) return;
      document.title = s.title;
      setContent(meta('property', 'og:title'), s.ogTitle);
      setContent(meta('name', 'twitter:title'), s.twTitle);
      setContent(meta('property', 'og:url'), s.ogUrl);
      const clnk = qs('link[rel="canonical"]');
      if (clnk) clnk.href = s.canonical;
      setContent(meta('name', 'description'), s.description);
      setContent(meta('property', 'og:description'), s.ogDescription);
      setContent(meta('name', 'twitter:description'), s.twDescription);
      setContent(meta('property', 'og:image'), s.ogImage);
      setContent(meta('name', 'twitter:image'), s.twImage);
    };
  }, [title, description, ogImage, canonical]);
}

function setContent(el, val) {
  if (el && val != null) el.content = val;
}
