import React, { useEffect, useState } from 'react';
import { X, Sparkles, Gem, ShoppingBag, Watch, Glasses, ChevronRight, Layers } from 'lucide-react';
import type { Category } from '../types.js';

interface CategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoryId: string) => void;
}

export const CategorySheet: React.FC<CategorySheetProps> = ({
  isOpen,
  onClose,
  onSelectCategory
}) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/v1/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setCategories(data.data);
        }
      })
      .catch(() => {
        // Fallback
        setCategories([
          { id: 'cat-jewelry', name: 'Jewelry & Rings', nameLt: 'Papuošalai ir žiedai', slug: 'jewelry', description: 'Handcrafted jewelry', image: '', productCount: 6 },
          { id: 'cat-bags', name: 'Bags & Totes', nameLt: 'Rankinės ir krepšiai', slug: 'bags', description: 'Totes and bags', image: '', productCount: 4 },
          { id: 'cat-accessories', name: 'Accessories & Belts', nameLt: 'Aksesuarai ir diržai', slug: 'accessories', description: 'Accessories', image: '', productCount: 5 },
          { id: 'cat-eyewear', name: 'Eyewear & Sunglasses', nameLt: 'Akiniai nuo saulės', slug: 'eyewear', description: 'Sunglasses', image: '', productCount: 3 },
          { id: 'cat-watches', name: 'Watches & Straps', nameLt: 'Laikrodžiai', slug: 'watches', description: 'Watches', image: '', productCount: 3 }
        ]);
      });
  }, []);

  if (!isOpen) return null;

  const getCategoryIcon = (id: string) => {
    if (id.includes('jewel')) return <Gem className="w-5 h-5 text-amber-600" />;
    if (id.includes('bag')) return <ShoppingBag className="w-5 h-5 text-rose-600" />;
    if (id.includes('watch')) return <Watch className="w-5 h-5 text-blue-600" />;
    if (id.includes('eye')) return <Glasses className="w-5 h-5 text-emerald-600" />;
    return <Layers className="w-5 h-5 text-zinc-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl z-10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        
        {/* Handle bar for native mobile sheet feel */}
        <div className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 font-serif">Categories & Collections</h3>
            <p className="text-xs text-zinc-500">Explore handcrafted accessories by style</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {/* View All */}
          <button
            onClick={() => {
              onSelectCategory('all');
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-900 bg-zinc-50 hover:bg-zinc-100 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 text-amber-200 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-sm text-zinc-900 block">All Collections</span>
                <span className="text-xs text-zinc-500">Visi gaminiai ir naujienos</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-transform group-hover:translate-x-0.5" />
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50/80 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-xs transition-all">
                  {getCategoryIcon(cat.id)}
                </div>
                <div>
                  <span className="font-semibold text-sm text-zinc-900 block">{cat.name}</span>
                  <span className="text-xs text-zinc-500">{cat.nameLt || 'Lietuvos kolekcija'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {cat.productCount !== undefined && (
                  <span className="text-xs text-zinc-400 font-medium px-2 py-0.5 bg-zinc-100 rounded-full">
                    {cat.productCount}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-700 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>

        {/* Promo tag */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <span>&bull; Fast EU Omniva / DPD Dispatch</span>
          <span>&bull; 14-Day Free Returns</span>
        </div>
      </div>
    </div>
  );
};
