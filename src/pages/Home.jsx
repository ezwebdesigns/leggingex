import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { fetchTopProducts, fetchSection } from '@/lib/supabaseApi';
import { useCountry } from '@/contexts/CountryContext';
import { supabase } from '@/lib/supabaseClient';
import MiniProductCard from '@/components/products/MiniProductCard';
import CategoryCircle from '@/components/home/CategoryCircle';
import CTACardGrid from '@/components/home/CTACardGrid';
import EditorialRow from '@/components/home/EditorialRow';
import AdBannerSection from '@/components/home/AdBannerSection';
import RecentArticles from '@/components/home/RecentArticles';
import FeaturedSectionRow from '@/components/home/FeaturedSectionRow';

function ProductCarousel({ title, products, viewAllLink, loading }) {
  const scrollRef = useRef(null);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4 px-4 md:px-6">
        <h2 className="text-base md:text-lg font-bold text-foreground">{title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink} className="flex items-center gap-1 text-sm text-primary font-medium hover:underline whitespace-nowrap">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="relative px-4 md:px-6">
        {loading ? (
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-36 sm:w-44 animate-pulse">
                <div className="aspect-square bg-muted rounded-2xl" />
                <div className="h-3 bg-muted rounded mt-2 w-3/4" />
                <div className="h-3 bg-muted rounded mt-1 w-1/2" />
              </div>
            ))}
          </div>
        ) : !products || products.length === 0 ? null : (
          <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {products.map((p) => <MiniProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function HeroBanners({ banners }) {
  if (!banners || banners.length === 0) return null;
  return (
    <div className={`grid ${banners.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'} gap-3 px-4 md:px-6 mb-10`}>
      {banners.map((b) => (
        <Link
          key={b.id}
          to={b.link}
          className="relative group h-40 sm:h-48 md:h-52 rounded-2xl overflow-hidden block"
        >
          <img
            src={b.image_url}
            alt={b.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4">
            <p className="text-white font-bold text-base">{b.title}</p>
            {b.subtitle && <p className="text-white/80 text-xs mt-0.5">{b.subtitle}</p>}
          </div>
          <div className="absolute top-3 right-3 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </div>
        </Link>
      ))}
    </div>
  );
}

function CategoryGrid({ categories }) {
  if (!categories || categories.length === 0) return null;
  return (
    <div className="px-4 md:px-6 mb-10">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {categories.map((c) => (
          <CategoryCircle key={c.id} label={c.label} value={c.value} imageUrl={c.image_url} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { marketplace } = useCountry();
  const [banners, setBanners] = useState([]);
  const [sections, setSections] = useState([]);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ctaCards, setCtaCards] = useState([]);
  const [editorialCards, setEditorialCards] = useState([]);
  const [adBanners, setAdBanners] = useState([]);
  const [articles, setArticles] = useState([]);
  const [featuredSections, setFeaturedSections] = useState([]);
  const [sectionProducts, setSectionProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [
          { data: bannerData },
          { data: sectionData },
          { data: tagData },
          { data: catData },
          { data: ctaData },
          { data: editorialData },
          { data: adData },
          { data: articleData },
          { data: featuredData },
        ] = await Promise.all([
          supabase.from('hero_banners').select('*').eq('is_active', true).order('sort_order').limit(50),
          supabase.from('home_sections').select('*').eq('is_active', true).order('sort_order').limit(50),
          supabase.from('category_tags').select('*').eq('is_active', true).order('sort_order').limit(50),
          supabase.from('home_categories').select('*').eq('is_active', true).order('sort_order').limit(50),
          supabase.from('cta_cards').select('*').eq('is_active', true).order('sort_order').limit(50),
          supabase.from('editorial_cards').select('*').eq('is_active', true).order('sort_order').limit(50),
          supabase.from('ad_banners').select('*').eq('is_active', true).order('sort_order').limit(50),
          supabase.from('pages').select('*').eq('type', 'blog_post').eq('published', true).order('published_at', { ascending: false }).limit(3),
          supabase.from('featured_sections').select('*').eq('is_active', true).order('sort_order').limit(20),
        ]);

        setBanners(bannerData || []);
        setSections(sectionData || []);
        setTags(tagData || []);
        setCategories(catData || []);
        setCtaCards(ctaData || []);
        setEditorialCards(editorialData || []);
        setAdBanners(adData || []);
        setArticles(articleData || []);

        // Fetch products for product-format featured sections
        const featuredList = (featuredData || []).map((s) => ({ ...s, _products: [] }));
        const productFormatIds = featuredList.filter((s) => s.format === 'product').map((s) => s.id);
        const productFetchPromises = featuredList
          .filter((s) => s.format === 'product')
          .map((s) =>
            s.category
              ? fetchSection(s.category, s.product_limit || 3, marketplace)
              : fetchTopProducts(s.product_limit || 3, marketplace)
          );
        const productFetchResults = await Promise.all(productFetchPromises);
        productFormatIds.forEach((id, i) => {
          const fs = featuredList.find((s) => s.id === id);
          if (fs) fs._products = productFetchResults[i] || [];
        });
        setFeaturedSections(featuredList);

        // Fetch products for product-type sections
        const productSections = (sectionData || []).filter((s) => !s.section_type || s.section_type === 'products');
        const productPromises = productSections.map((section) =>
          section.category
            ? fetchSection(section.category, section.limit || 8, marketplace)
            : fetchTopProducts(section.limit || 12, marketplace)
        );
        const productResults = await Promise.all(productPromises);

        const productsMap = {};
        productSections.forEach((section, i) => {
          productsMap[section.id] = productResults[i];
        });
        setSectionProducts(productsMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [marketplace]);

  return (
    <div className="min-h-screen bg-background">
      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-4 md:px-6 py-3 border-b border-border">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            to={`/catalogue?category=${encodeURIComponent(tag.value)}`}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium bg-secondary border border-border/50 text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/30 transition-all whitespace-nowrap inline-flex items-center gap-1.5"
          >
            {tag.image_url && (
              <img src={tag.image_url} alt="" className="w-5 h-5 rounded-full object-cover" />
            )}
            {tag.label}
          </Link>
        ))}
      </div>

      <div className="pt-6">
        <HeroBanners banners={banners} />
      </div>

      <CategoryGrid categories={categories} />

      {/* Sections rendered based on section_type */}
      {(() => {
        const rendered = [];
        let i = 0;
        while (i < sections.length) {
          const section = sections[i];
          const type = section.section_type || 'products';

          if (type === 'featured') {
            const fs1 = featuredSections.find((f) => f.id === section.featured_section_id);
            const fs2 = featuredSections.find((f) => f.id === section.featured_section_id_2);
            const pair = [fs1, fs2].filter(Boolean);
            if (pair.length > 0) {
              rendered.push(<FeaturedSectionRow key={`featured-${section.id}`} sections={pair} />);
            }
            i++;
          } else {
            if (type === 'products') {
              const products = sectionProducts[section.id] || [];
              const viewAllLink = section.category
                ? `/catalogue?category=${encodeURIComponent(section.category)}`
                : '/catalogue';
              rendered.push(
                <ProductCarousel
                  key={section.id}
                  title={section.title}
                  products={products}
                  viewAllLink={viewAllLink}
                  loading={loading}
                />
              );
            } else if (type === 'cta_cards') {
              rendered.push(<CTACardGrid key={section.id} cards={ctaCards} title={section.title} />);
            } else if (type === 'editorial') {
              rendered.push(<EditorialRow key={section.id} cards={editorialCards} title={section.title} />);
            } else if (type === 'ad_banner') {
              rendered.push(<AdBannerSection key={section.id} banners={adBanners} />);
            } else if (type === 'articles') {
              rendered.push(<RecentArticles key={section.id} articles={articles} title={section.title} />);
            }
            i++;
          }
        }
        return rendered;
      })()}
    </div>
  );
}