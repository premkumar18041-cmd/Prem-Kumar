import React, { useState, useEffect } from 'react';
import { Hero } from '../components/Hero.js';
import { CategoryGrid } from '../components/CategoryGrid.js';
import { ProductCard } from '../components/ProductCard.js';
import { BrandValues } from '../components/BrandValues.js';
import { CustomerReviewsSection } from '../components/CustomerReviewsSection.js';
import { ProductQuickView } from '../components/ProductQuickView.js';
import { api } from '../lib/api.js';
import type { Product, Category } from '../types.js';
import { ArrowRight, Sparkles, TrendingUp, Award } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext.js';

interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t, language } = useCurrency();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [catsRes, featRes, newRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ featured: true }),
          api.getProducts({ sort: 'newest' })
        ]);

        if (catsRes.success) setCategories(catsRes.data);
        if (featRes.success) setFeaturedProducts(featRes.data);
        if (newRes.success) setNewArrivals(newRes.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <Hero
        onExplore={() => onNavigate('shop')}
        onNewArrivals={() => onNavigate('shop', 'sort=newest')}
      />

      {/* 2. Featured Collections Grid */}
      <CategoryGrid
        categories={categories}
        onSelectCategory={(slug) => onNavigate('shop', `category=${slug}`)}
      />

      {/* 3. Best Sellers / Featured Section */}
      <section className="py-16 bg-white border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-700">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Trending Now</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-zinc-950 mt-1">
                {t('bestSellers')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('shop')}
              className="text-xs font-semibold text-zinc-900 hover:text-amber-800 inline-flex items-center gap-1.5 mt-3 sm:mt-0 transition-colors group cursor-pointer"
            >
              <span>View All Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={(slug) => onNavigate('product', slug)}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Editorial Visual Banner */}
      <section className="py-16 bg-zinc-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 flex flex-col lg:flex-row items-center">
            <div className="p-8 sm:p-12 lg:p-16 lg:w-1/2 space-y-6">
              <span className="inline-block px-3 py-1 bg-amber-400/20 text-amber-300 text-xs font-semibold rounded-full tracking-wider uppercase">
                Artisanal Spotlight
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Authentic Kashmiri Ghangharoo Bangles
              </h3>
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-light">
                Hand-blown glass crafted with radiant vermilion hues, shimmering gold filigree, and soothing metallic tinkles. 
                Sourced directly from traditional craft artisans and stocked in Vilnius for fast European dispatch.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('product', 'kashmiri-bangles-for-women')}
                  className="px-6 py-3 bg-amber-300 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-full transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Shop The Kashmiri Bangles</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:w-1/2 h-80 lg:h-full relative w-full overflow-hidden">
              <img
                src="https://accessories.lt/wp-content/uploads/2026/09/pic-38.jpg"
                alt="Artisanal glass bangles on model"
                className="w-full h-full object-cover filter contrast-110"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. New Arrivals Showcase */}
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fresh in Store</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-zinc-950 mt-1">
                {t('newArrivals')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('shop', 'sort=newest')}
              className="text-xs font-semibold text-zinc-900 hover:text-amber-800 inline-flex items-center gap-1.5 mt-3 sm:mt-0 transition-colors group cursor-pointer"
            >
              <span>Explore All New Pieces</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={(slug) => onNavigate('product', slug)}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Brand Values Guarantee */}
      <BrandValues />

      {/* 7. Customer Testimonials */}
      <CustomerReviewsSection />

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onViewFullDetails={(slug) => onNavigate('product', slug)}
        />
      )}
    </div>
  );
};
