import React, { useState } from 'react';
import { X, Star, ShoppingBag, ShieldCheck, Truck, ArrowRight, Heart } from 'lucide-react';
import type { Product } from '../types.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useCurrency } from '../context/CurrencyContext.js';

interface ProductQuickViewProps {
  product: Product | null;
  onClose: () => void;
  onViewFullDetails: (slug: string) => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  onClose,
  onViewFullDetails
}) => {
  if (!product) return null;

  const { addToCart, loading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice, language, t } = useCurrency();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants?.[0]?.id
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const images = product.images.length > 0 
    ? product.images 
    : ['https://accessories.lt/wp-content/uploads/2026/09/pic-38.jpg'];

  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);
  const currentPrice = selectedVariant?.salePrice || selectedVariant?.price || product.salePrice || product.price;
  const regularPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAdd = async () => {
    await addToCart(product.id, quantity, selectedVariantId);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-zinc-200 flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-zinc-100 text-zinc-600 transition-colors shadow-xs"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Column */}
        <div className="md:w-1/2 bg-zinc-50 p-6 flex flex-col justify-between">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 mb-4 border border-zinc-200/80">
            <img
              src={images[activeImageIdx] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIdx === idx ? 'border-zinc-950 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                {product.categoryName}
              </span>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="text-zinc-400 hover:text-rose-600 transition-colors p-1"
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-rose-600 text-rose-600' : ''}`} />
              </button>
            </div>

            <h2 className="font-serif text-2xl font-bold text-zinc-900 mt-1">
              {language === 'lt' && product.nameLt ? product.nameLt : product.name}
            </h2>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-zinc-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-zinc-600">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price & Stock */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-zinc-950">{formatPrice(currentPrice)}</span>
              {regularPrice > currentPrice && (
                <span className="text-sm text-zinc-400 line-through">{formatPrice(regularPrice)}</span>
              )}
              <span className="text-xs font-mono text-zinc-500 ml-auto">SKU: {product.sku}</span>
            </div>

            <p className="mt-4 text-xs text-zinc-600 leading-relaxed line-clamp-3">
              {language === 'lt' && product.descriptionLt ? product.descriptionLt : product.description}
            </p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-5">
                <label className="text-xs font-semibold text-zinc-800 block mb-2">Options</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        selectedVariantId === v.id
                          ? 'border-zinc-950 bg-zinc-950 text-white'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-zinc-600 hover:bg-zinc-100 text-sm font-semibold"
                >
                  -
                </button>
                <span className="px-4 text-sm font-semibold text-zinc-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="px-3 py-2 text-zinc-600 hover:bg-zinc-100 text-sm font-semibold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={currentStock <= 0 || loading}
                className="flex-1 py-3 px-6 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{added ? 'Added to Bag!' : t('addToCart')}</span>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-100 space-y-2 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dispatches within 24h &bull; Omniva / DPD Locker or Courier</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>14-Day EU Statutory Right of Return</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 text-right">
            <button
              onClick={() => {
                onViewFullDetails(product.slug);
                onClose();
              }}
              className="text-xs font-semibold text-zinc-950 hover:text-amber-800 inline-flex items-center gap-1"
            >
              View Full Product Page <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
