import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import type { Product } from '../types.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useCurrency } from '../context/CurrencyContext.js';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (slug: string) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct, onQuickView }) => {
  const { addToCart, loading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice, language, t } = useCurrency();

  const [isHovered, setIsHovered] = useState(false);
  const [adding, setAdding] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const mainImage = product.images[0] || 'https://accessories.lt/wp-content/uploads/2026/09/pic-38.jpg';
  const secondaryImage = product.images[1] || mainImage;

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - (product.salePrice as number)) / product.price) * 100)
    : 0;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setAdding(true);
      await addToCart(product.id, 1);
    } finally {
      setAdding(false);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView(product);
  };

  return (
    <div
      onClick={() => onSelectProduct(product.slug)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-white rounded-xl border border-zinc-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
        <img
          src={isHovered ? secondaryImage : mainImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {hasDiscount && (
            <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider bg-rose-600 text-white rounded-md uppercase">
              -{discountPercent}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider bg-zinc-950 text-amber-300 rounded-md uppercase">
              Popular
            </span>
          )}
          {product.isNewArrival && !hasDiscount && (
            <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider bg-emerald-600 text-white rounded-md uppercase">
              New
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs text-zinc-700 hover:text-rose-600 shadow-sm transition-transform hover:scale-110 z-10"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>

        {/* Quick View Button */}
        <div className="absolute bottom-3 inset-x-3 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={handleQuickViewClick}
            className="w-full py-2 px-3 bg-white/95 backdrop-blur-md hover:bg-white text-zinc-900 text-xs font-semibold rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            {product.categoryName}
          </span>

          <h3 className="font-medium text-sm text-zinc-900 line-clamp-2 mt-1 group-hover:text-amber-800 transition-colors">
            {language === 'lt' && product.nameLt ? product.nameLt : product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-semibold text-zinc-800">{product.rating.toFixed(1)}</span>
            <span className="text-[11px] text-zinc-400">({product.reviewCount})</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-zinc-950">
                {formatPrice(product.salePrice || product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-zinc-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <span className={`text-[10px] font-medium mt-0.5 ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {product.stock > 0 ? `${product.stock < 5 ? `Only ${product.stock} left` : t('inStock')}` : t('outOfStock')}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0 || adding}
            className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
              product.stock > 0
                ? 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
            }`}
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
