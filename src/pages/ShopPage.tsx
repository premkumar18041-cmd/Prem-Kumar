import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  Check, 
  Search, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard.js';
import { ProductQuickView } from '../components/ProductQuickView.js';
import { api } from '../lib/api.js';
import type { Product, Category } from '../types.js';
import { useCurrency } from '../context/CurrencyContext.js';

interface ShopPageProps {
  initialParam?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ initialParam, onNavigate }) => {
  const { t, formatPrice, language } = useCurrency();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Parse initial query params (e.g. category=jewelry, q=bangles, sort=newest)
  useEffect(() => {
    if (initialParam) {
      const params = new URLSearchParams(initialParam);
      if (params.has('category')) setSelectedCategory(params.get('category') || 'all');
      if (params.has('q')) setSearchQuery(params.get('q') || '');
      if (params.has('sort')) setSortBy(params.get('sort') || 'featured');
      if (params.has('sale')) setOnSaleOnly(true);
    }
  }, [initialParam]);

  // Load categories
  useEffect(() => {
    api.getCategories().then(res => {
      if (res.success) setCategories(res.data);
    }).catch(console.error);
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    async function loadFilteredProducts() {
      setLoading(true);
      try {
        const res = await api.getProducts({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          q: searchQuery.trim() || undefined,
          sort: sortBy,
          minPrice: minPrice > 0 ? minPrice : undefined,
          maxPrice: maxPrice < 200 ? maxPrice : undefined,
          inStock: inStockOnly || undefined
        });

        if (res.success) {
          let list = res.data;
          if (onSaleOnly) {
            list = list.filter(p => p.salePrice && p.salePrice < p.price);
          }
          setProducts(list);
        }
      } catch (err) {
        console.error('Failed to load filtered products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFilteredProducts();
  }, [selectedCategory, searchQuery, sortBy, minPrice, maxPrice, inStockOnly, onSaleOnly]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    setMinPrice(0);
    setMaxPrice(200);
    setInStockOnly(false);
    setOnSaleOnly(false);
  };

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    searchQuery.trim() !== '' || 
    minPrice > 0 || 
    maxPrice < 200 || 
    inStockOnly || 
    onSaleOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* 1. Header & Breadcrumbs */}
      <div className="pb-8 border-b border-zinc-200">
        <nav className="text-xs text-zinc-500 mb-2 flex items-center gap-2">
          <button onClick={() => onNavigate('home')} className="hover:text-zinc-950">Home</button>
          <span>/</span>
          <span className="text-zinc-900 font-medium">Shop</span>
          {selectedCategory !== 'all' && (
            <>
              <span>/</span>
              <span className="text-amber-800 capitalize">{selectedCategory}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-950">
              {selectedCategory === 'all' 
                ? 'All Accessories' 
                : categories.find(c => c.slug === selectedCategory)?.name || 'Collection'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Curated everyday fashion jewelry, artisanal bangles, and structured office bags.
            </p>
          </div>

          <span className="text-xs font-semibold text-zinc-600 self-start md:self-auto">
            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
          </span>
        </div>
      </div>

      {/* 2. Top Filter Bar & Sorting */}
      <div className="py-4 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-zinc-950 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full shrink-0 transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {language === 'lt' ? cat.nameLt : cat.name}
            </button>
          ))}
        </div>

        {/* Sort & Mobile Filter Trigger */}
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-lg"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {hasActiveFilters && '(Active)'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-zinc-200 text-xs font-medium rounded-lg px-2.5 py-1.5 text-zinc-800 focus:outline-none focus:border-zinc-950 cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="newest">New Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Main Layout: Sidebar Filters + Product Grid */}
      <div className="flex gap-8 mt-6">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-60 shrink-0 space-y-6">
          
          {/* Active Filter Tags & Reset */}
          {hasActiveFilters && (
            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                  Active Filters
                </span>
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-rose-600 hover:text-rose-800 font-medium underline"
                >
                  Clear all
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-zinc-200 rounded text-[11px] text-zinc-700">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')}><X className="w-3 h-3 text-zinc-400 hover:text-zinc-700" /></button>
                  </span>
                )}
                {onSaleOnly && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-700">
                    On Sale
                    <button onClick={() => setOnSaleOnly(false)}><X className="w-3 h-3 text-rose-400 hover:text-rose-700" /></button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-700">
                    In Stock
                    <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3 text-emerald-400 hover:text-emerald-700" /></button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Search within shop */}
          <div>
            <label className="text-xs font-bold text-zinc-900 block mb-2 uppercase tracking-wider">
              Keyword Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
              />
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="text-xs font-bold text-zinc-900 block mb-2 uppercase tracking-wider">
              Price Range ({formatPrice(minPrice)} - {formatPrice(maxPrice)})
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-zinc-950 cursor-pointer"
              />
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{formatPrice(0)}</span>
                <span>Max: {formatPrice(maxPrice)}</span>
              </div>
            </div>
          </div>

          {/* Availability & Special Offers */}
          <div className="space-y-2.5 pt-4 border-t border-zinc-200">
            <label className="text-xs font-bold text-zinc-900 block uppercase tracking-wider">
              Status & Offers
            </label>
            
            <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-zinc-950 focus:ring-0 cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => setOnSaleOnly(e.target.checked)}
                className="rounded text-zinc-950 focus:ring-0 cursor-pointer"
              />
              <span>Discounted Items Only</span>
            </label>
          </div>

          {/* Free Shipping Perk */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-1">
            <p className="font-bold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Free Delivery Perk
            </p>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Orders of {formatPrice(40)} or more receive free express parcel locker and courier delivery.
            </p>
          </div>

        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-zinc-100 rounded-xl h-80" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 space-y-4">
              <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-zinc-900">
                No items match your selected filters
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Try widening your price range, searching a different term, or clearing all filters to explore the catalog.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={(slug) => onNavigate('product', slug)}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

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
