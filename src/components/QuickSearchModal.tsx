import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight, Sparkles } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext.js';
import type { Product } from '../types.js';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (slug: string) => void;
  onViewAllResults: (query: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onViewAllResults
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { formatPrice } = useCurrency();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.success && data.data) {
          setResults(data.data.slice(0, 6));
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-16 p-3">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Sheet / Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-10 animate-in slide-in-from-top-4 duration-150 flex flex-col max-h-[85vh]">
        
        {/* Search Input Bar */}
        <div className="p-3 border-b border-zinc-100 flex items-center gap-2">
          <Search className="w-5 h-5 text-zinc-400 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                onViewAllResults(query.trim());
                onClose();
              }
            }}
            placeholder="Search jewelry, bags, accessories..."
            className="flex-1 bg-transparent text-sm text-zinc-900 focus:outline-hidden py-1"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-zinc-400 hover:text-zinc-600 p-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results / Suggestions */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading && (
            <div className="py-8 text-center text-xs text-zinc-400">
              Searching Accessories.lt catalog...
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-2">
                Products ({results.length})
              </span>
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product.slug);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 text-left transition-colors group"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-zinc-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-zinc-900 block truncate group-hover:text-amber-700 transition-colors">
                      {product.name}
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      {product.categoryName} &bull; SKU: {product.sku}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-zinc-900 block">
                      {formatPrice(product.salePrice ?? product.price)}
                    </span>
                    {product.salePrice && (
                      <span className="text-[10px] text-zinc-400 line-through block">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </button>
              ))}

              <button
                onClick={() => {
                  onViewAllResults(query.trim());
                  onClose();
                }}
                className="w-full py-2.5 mt-2 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View all search results</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm font-medium text-zinc-700">No products found for "{query}"</p>
              <p className="text-xs text-zinc-400 mt-1">Try searching for "bangles", "earrings", or "tote"</p>
            </div>
          )}

          {!query && (
            <div className="space-y-3 py-2 px-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Popular Searches
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['Kashmiri Bangles', 'Gold Studs', 'Leather Tote', 'Hoop Earrings', 'Silk Scarf'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xs text-zinc-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
