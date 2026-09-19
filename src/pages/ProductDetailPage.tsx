import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  Share2, 
  Check, 
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useCurrency } from '../context/CurrencyContext.js';
import { ProductCard } from '../components/ProductCard.js';
import type { Product, Review } from '../types.js';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (view: string, param?: string) => void;
  onInstantBuy: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, onNavigate, onInstantBuy }) => {
  const { addToCart, loading: cartLoading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice, language, t } = useCurrency();

  const [product, setProduct] = useState<(Product & { reviews: Review[]; relatedProducts: Product[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Variant & Quantity
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Review submission
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getProduct(slug);
        if (res.success && res.data) {
          setProduct(res.data);
          setActiveImageIdx(0);
          if (res.data.variants && res.data.variants.length > 0) {
            setSelectedVariantId(res.data.variants[0].id);
          }
          // Log product view analytics
          api.logEvent('PRODUCT_VIEW', { productId: res.data.id, name: res.data.name });
        } else {
          setError('Product not found');
        }
      } catch (err: any) {
        setError(err.message || 'Error loading product');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-zinc-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-zinc-200 w-1/4 rounded" />
            <div className="h-8 bg-zinc-200 w-3/4 rounded" />
            <div className="h-6 bg-zinc-200 w-1/3 rounded" />
            <div className="h-32 bg-zinc-200 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-2xl font-bold text-zinc-900">Product Not Found</h2>
        <p className="text-xs text-zinc-500 mt-2">The accessory you are looking for may have been retired or moved.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="mt-6 px-6 py-2.5 bg-zinc-950 text-white text-xs font-semibold rounded-full hover:bg-zinc-900"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const images = product.images.length > 0 
    ? product.images 
    : ['https://accessories.lt/wp-content/uploads/2026/09/pic-38.jpg'];

  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);
  const currentPrice = selectedVariant?.salePrice || selectedVariant?.price || product.salePrice || product.price;
  const regularPrice = selectedVariant?.price || product.price;
  const hasDiscount = regularPrice > currentPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity, selectedVariantId);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2500);
  };

  const handleBuyNow = async () => {
    await addToCart(product.id, quantity, selectedVariantId);
    onInstantBuy();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.submitReview({
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        customerName: reviewAuthor || undefined
      });
      if (res.success) {
        setReviewSubmitted(true);
        setShowReviewForm(false);
        // Refresh product reviews
        const updated = await api.getProduct(slug);
        if (updated.success) setProduct(updated.data);
      }
    } catch (err) {
      alert('Could not submit review. Please check all fields.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. Breadcrumbs */}
      <nav className="text-xs text-zinc-500 mb-6 flex items-center gap-2">
        <button onClick={() => onNavigate('home')} className="hover:text-zinc-950">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('shop')} className="hover:text-zinc-950">Shop</button>
        <span>/</span>
        <button 
          onClick={() => onNavigate('shop', `category=${product.categorySlug}`)} 
          className="hover:text-zinc-950 capitalize"
        >
          {product.categoryName}
        </button>
        <span>/</span>
        <span className="text-zinc-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* 2. Product Detail Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Gallery Column */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm">
            <img
              src={images[activeImageIdx] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-2.5 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                Sale
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-xs text-zinc-700 hover:text-rose-600 shadow-md transition-all hover:scale-110"
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-rose-600 text-rose-600' : ''}`} />
            </button>
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIdx === idx 
                      ? 'border-zinc-950 ring-2 ring-zinc-950/10 scale-105' 
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information Column */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">
                {product.categoryName}
              </span>
              <span className="text-xs font-mono text-zinc-500">
                SKU: {selectedVariant?.sku || product.sku}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-950 mt-2">
              {language === 'lt' && product.nameLt ? product.nameLt : product.name}
            </h1>

            {/* Rating Stars & Reviews link */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-zinc-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-zinc-900">{product.rating.toFixed(1)}</span>
              <a href="#reviews" className="text-xs text-zinc-500 hover:text-zinc-800 underline">
                {product.reviewCount} customer reviews
              </a>
            </div>

            {/* Pricing */}
            <div className="mt-5 flex items-baseline gap-3 pb-5 border-b border-zinc-200">
              <span className="text-3xl font-bold text-zinc-950">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-base text-zinc-400 line-through">
                  {formatPrice(regularPrice)}
                </span>
              )}
              {hasDiscount && (
                <span className="px-2 py-0.5 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-md">
                  Save {formatPrice(regularPrice - currentPrice)}
                </span>
              )}
              <span className="text-xs text-zinc-500 ml-auto">
                Includes 21% Lithuanian VAT
              </span>
            </div>

            {/* Short Description */}
            <p className="mt-5 text-sm text-zinc-600 leading-relaxed font-light">
              {language === 'lt' && product.descriptionLt ? product.descriptionLt : product.description}
            </p>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-6">
                <label className="text-xs font-bold text-zinc-900 block mb-2 uppercase tracking-wider">
                  Select Specification:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-4 py-2 text-xs font-medium rounded-xl border transition-all ${
                        selectedVariantId === v.id
                          ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs'
                          : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      <span>{v.name}</span>
                      {v.stock < 5 && (
                        <span className="ml-1.5 text-[10px] text-amber-400">({v.stock} left)</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-zinc-300 rounded-xl bg-zinc-50 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-3 text-zinc-700 hover:bg-zinc-200 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-semibold text-zinc-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="px-3.5 py-3 text-zinc-700 hover:bg-zinc-200 text-sm font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0 || cartLoading}
                  className="flex-1 py-3.5 px-6 bg-zinc-950 hover:bg-zinc-900 disabled:bg-zinc-300 text-white text-sm font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{addedAnimation ? 'Added to Bag!' : t('addToCart')}</span>
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className="w-full py-3.5 px-6 bg-amber-300 hover:bg-amber-400 text-zinc-950 text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Express Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Delivery & Assurance Badges */}
            <div className="mt-8 p-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-3 text-xs text-zinc-700">
              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-900">Delivery in 1–3 Business Days:</span>
                  <p className="text-zinc-500 text-[11px] mt-0.5">
                    Express parcel lockers and courier available. Free on orders above {formatPrice(40)}.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RefreshCw className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-900">14-Day Statutory Returns:</span>
                  <p className="text-zinc-500 text-[11px] mt-0.5">
                    Statutory right of return under EU law. Return or exchange without hassle.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-900">Guaranteed Hypoallergenic Craftsmanship:</span>
                  <p className="text-zinc-500 text-[11px] mt-0.5">
                    Lead-free, nickel-tested, and safe for sensitive skin everyday wear.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 3. Product Specifications Table */}
      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <section className="mt-16 pt-12 border-t border-zinc-200">
          <h3 className="font-serif text-2xl font-bold text-zinc-950 mb-6">
            Specifications & Materials
          </h3>
          <div className="max-w-2xl bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <dl className="divide-y divide-zinc-200">
              {Object.entries(product.attributes).map(([key, val], idx) => (
                <div key={key} className={`px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 ${idx % 2 === 0 ? 'bg-zinc-50/50' : 'bg-white'}`}>
                  <dt className="text-xs font-semibold text-zinc-500 capitalize">{key}</dt>
                  <dd className="mt-1 text-xs text-zinc-900 sm:mt-0 sm:col-span-2 font-medium">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* 4. Customer Reviews Section with Form */}
      <section id="reviews" className="mt-16 pt-12 border-t border-zinc-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="font-serif text-2xl font-bold text-zinc-950">
              Customer Reviews ({product.reviewCount})
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Verified feedback from real customers</p>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold rounded-lg self-start sm:self-auto cursor-pointer"
          >
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="mb-10 p-6 bg-zinc-50 border border-zinc-200 rounded-2xl max-w-xl space-y-4">
            <h4 className="font-serif font-bold text-base text-zinc-900">Share your experience</h4>
            
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1">Rating</label>
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-400' : 'text-zinc-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1">Your Name</label>
              <input
                type="text"
                required
                value={reviewAuthor}
                onChange={(e) => setReviewAuthor(e.target.value)}
                placeholder="Elena R."
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1">Review Headline</label>
              <input
                type="text"
                required
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Stunning colors and fast delivery"
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1">Detailed Review</label>
              <textarea
                required
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Describe the craftsmanship, fit, feel, and packaging..."
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-zinc-950 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800"
            >
              Submit Verified Review
            </button>
          </form>
        )}

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div key={rev.id} className="p-5 bg-white border border-zinc-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900">{rev.customerName}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                      Verified Purchase
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-zinc-200'}`}
                    />
                  ))}
                </div>

                <h5 className="text-xs font-bold text-zinc-900">{rev.title}</h5>
                <p className="text-xs text-zinc-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-zinc-500 italic">
              No customer reviews yet. Be the first to share your thoughts on this accessory!
            </p>
          )}
        </div>
      </section>

      {/* 5. Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-zinc-200">
          <h3 className="font-serif text-2xl font-bold text-zinc-950 mb-8">
            Complete The Look
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onSelectProduct={(s) => onNavigate('product', s)}
                onQuickView={() => {}}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
