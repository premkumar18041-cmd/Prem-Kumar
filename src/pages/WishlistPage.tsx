import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.js';
import { useCart } from '../context/CartContext.js';
import { useCurrency } from '../context/CurrencyContext.js';
import { api } from '../lib/api.js';
import type { Product } from '../types.js';

interface WishlistPageProps {
  onNavigateToProduct: (slug: string) => void;
  onNavigateToShop: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  onNavigateToProduct,
  onNavigateToShop
}) => {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlistProducts() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const all = await api.getProducts();
        if (all.success) {
          const matched = all.data.filter(p => wishlistIds.includes(p.id));
          setProducts(matched);
        }
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWishlistProducts();
  }, [wishlistIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="pb-6 border-b border-zinc-200 mb-8">
        <h1 className="font-serif text-3xl font-bold text-zinc-950">
          My Saved Wishlist ({wishlistIds.length})
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Keep track of accessories you love and move them to your bag when ready.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-100 rounded-xl h-72" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="p-16 bg-white border border-zinc-200 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-xl font-bold text-zinc-900">Your wishlist is empty</h2>
          <p className="text-xs text-zinc-500">
            Explore our curated Kashmiri bangles, earrings, and laptop totes to save your favorites.
          </p>
          <button
            onClick={onNavigateToShop}
            className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-xl border border-zinc-200 overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow"
            >
              <div 
                onClick={() => onNavigateToProduct(product.slug)}
                className="cursor-pointer relative aspect-square overflow-hidden bg-zinc-100"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-rose-600 hover:bg-white shadow-xs"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-[10px] font-medium text-zinc-400 uppercase">
                    {product.categoryName}
                  </span>
                  <h3 
                    onClick={() => onNavigateToProduct(product.slug)}
                    className="text-xs font-semibold text-zinc-900 line-clamp-2 mt-1 cursor-pointer hover:text-amber-800"
                  >
                    {product.name}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-950">
                    {formatPrice(product.salePrice || product.price)}
                  </span>
                  <button
                    onClick={() => addToCart(product.id, 1)}
                    disabled={product.stock <= 0}
                    className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
