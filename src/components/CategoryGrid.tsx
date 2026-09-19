import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Category } from '../types.js';
import { useCurrency } from '../context/CurrencyContext.js';

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (slug: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onSelectCategory }) => {
  const { language, t } = useCurrency();

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <span className="text-xs font-semibold tracking-widest text-amber-700 uppercase">
            Curated Collections
          </span>
          <h2 className="font-serif text-3xl font-bold text-zinc-950 mt-1">
            {t('featuredCategories')}
          </h2>
        </div>
        <p className="text-sm text-zinc-500 mt-2 md:mt-0 max-w-md">
          Explore artisanal glass bangles, sculpted everyday earrings, and everyday structured bags designed to carry your life with ease.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat.slug)}
            className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <img
              src={cat.image || cat.imageUrl || 'https://accessories.lt/wp-content/uploads/2026/09/pic-38.jpg'}
              alt={cat.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/30 to-transparent" />
            
            <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium tracking-wider text-amber-300 uppercase">
                    {cat.productCount ? `${cat.productCount} Products` : 'Collection'}
                  </span>
                  <h3 className="font-serif text-xl font-bold mt-1 text-white">
                    {language === 'lt' ? cat.nameLt : cat.name}
                  </h3>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-amber-300 group-hover:text-zinc-950 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
