import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Leaf,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  MessageSquare,
  BarChart2,
  Bell,
  BellRing,
  CheckCircle,
} from 'lucide-react';
import { Product } from '../types/index.js';
import { api } from '../services/api.js';
import { formatCurrency, getTrustBadge, formatDate } from '../utils/formatters.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { useComparison } from '../context/ComparisonContext.js';
import { usePriceWatch } from '../context/PriceWatchContext.js';
import { BestDealComparison } from '../components/customer/BestDealComparison.js';

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { success, error } = useToast();
  const { addToCompare, isCompared } = useComparison();
  const { setPriceWatch, removePriceWatch, isWatching, getWatchTarget } = usePriceWatch();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Price Watch Modal / Input State
  const [showPriceWatchModal, setShowPriceWatchModal] = useState(false);
  const [targetPriceInput, setTargetPriceInput] = useState<string>('');

  // Review Form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState<{
    canReview: boolean;
    hasDeliveredOrder: boolean;
    alreadyReviewed: boolean;
  } | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await api.getProduct(slug);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
      } catch (err: any) {
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  useEffect(() => {
    async function checkEligibility() {
      if (!product || !user) {
        setReviewEligibility(null);
        return;
      }
      try {
        const res = await api.checkReviewEligibility(product.id);
        setReviewEligibility(res);
      } catch {
        setReviewEligibility(null);
      }
    }
    checkEligibility();
  }, [product?.id, user?.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
    } catch {
      // Handled in context
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
      navigate('/cart');
    } catch {
      // Handled in context
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) {
      error('Please log in to submit a review');
      return;
    }
    if (!reviewComment.trim()) {
      error('Please write your review comment');
      return;
    }

    try {
      setSubmittingReview(true);
      await api.addReview(product.id, reviewRating, reviewComment.trim());
      success('Thank you! Your review has been published.');
      setReviewComment('');
      setReviewEligibility({
        canReview: false,
        hasDeliveredOrder: true,
        alreadyReviewed: true,
      });
      // Reload product data to refresh rating
      const refreshed = await api.getProduct(product.slug);
      setProduct(refreshed);
    } catch (err: any) {
      error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <Link to="/products" className="text-indigo-600 font-semibold hover:underline">
          Return to Marketplace Catalog
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const trustBadge = getTrustBadge(product.vendor.trustScore);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Product Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs relative">
            <img
              src={selectedImage || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {product.discountPercent}% OFF
              </span>
            )}
            {product.isEcoFriendly && (
              <span className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Leaf className="w-3.5 h-3.5" /> Eco-Certified
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img ? 'border-indigo-600 scale-95 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Buying Options */}
        <div className="lg:col-span-6 space-y-6">
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <Link to={`/products?category=${product.category.slug}`} className="font-semibold text-indigo-600 hover:underline">
              {product.category.name}
            </Link>
            {product.sku && <span className="font-mono text-slate-400">SKU: {product.sku}</span>}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
            {product.title}
          </h1>

          {/* Rating and Reviews summary */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating > 0 ? product.rating.toFixed(1) : '4.8'}</span>
            </div>
            <span className="text-xs text-slate-500">
              {product.numReviews} Verified Buyer Ratings
            </span>
          </div>

          {/* Primary Seller Box with Trust Badge */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 font-bold text-sm shadow-xs">
                {product.vendor.storeName.charAt(0)}
              </div>
              <div>
                <Link to={`/products?vendor=${product.vendor.slug}`} className="text-sm font-bold text-slate-900 hover:text-indigo-600">
                  {product.vendor.storeName}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold ${trustBadge.colorClass}`}>
                    <ShieldCheck className="w-3.5 h-3.5" /> {trustBadge.badgeLabel}
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-xs text-slate-600 font-semibold">{product.vendor.trustScore}% Trust Score</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-base text-slate-400 line-through font-medium">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  Save {product.discountPercent}%
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Inclusive of all taxes. Free delivery on orders over ₹1,000</p>
          </div>

          {/* Eco-Friendly Feature Callout */}
          {product.isEcoFriendly && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
              <Leaf className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                  Eco-Conscious Product
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  {product.ecoDetails || 'This product and its packaging meet sustainable, zero-plastic and carbon-neutral standards.'}
                </p>
              </div>
            </div>
          )}

          {/* Stock & Quantity */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs font-bold text-slate-700">Quantity:</span>
            <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-xs">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-bold"
              >
                -
              </button>
              <span className="px-4 py-1.5 text-xs font-bold text-slate-800">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-bold"
              >
                +
              </button>
            </div>
            <span className="text-xs text-slate-500">
              {product.stock > 0 ? (
                product.stock <= 5 ? (
                  <span className="text-amber-600 font-bold">Only {product.stock} units remaining</span>
                ) : (
                  <span className="text-emerald-600 font-medium">In Stock ({product.stock} units)</span>
                )
              ) : (
                <span className="text-rose-500 font-bold">Out of stock</span>
              )}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                product.stock > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Add to Multi-Vendor Cart
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className={`py-3.5 px-6 rounded-xl font-bold text-sm transition-all ${
                product.stock > 0
                  ? 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95 shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Buy Now
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-3.5 rounded-xl border transition-all ${
                inWishlist
                  ? 'bg-rose-50 border-rose-200 text-rose-500'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-rose-500 hover:bg-slate-50'
              }`}
              title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={() => addToCompare(product)}
              className={`p-3.5 rounded-xl border transition-all ${
                isCompared(product.id)
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
              }`}
              title={isCompared(product.id) ? 'Remove from comparison' : 'Compare with other products (max 3)'}
            >
              <BarChart2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (isWatching(product.id)) {
                  removePriceWatch(product.id);
                } else {
                  setTargetPriceInput(String(Math.round(product.price * 0.9)));
                  setShowPriceWatchModal(true);
                }
              }}
              className={`p-3.5 rounded-xl border transition-all ${
                isWatching(product.id)
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-slate-50'
              }`}
              title={isWatching(product.id) ? `Watching: alert under ₹${getWatchTarget(product.id)} (Click to remove)` : 'Set Price Watch alert'}
            >
              {isWatching(product.id) ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </button>
          </div>

          {/* Price Watch Info Chip if active */}
          {isWatching(product.id) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs text-amber-900">
              <span className="flex items-center gap-1.5 font-medium">
                <BellRing className="w-4 h-4 text-amber-600" />
                Price Watch Active: Alerting when price drops to or below {formatCurrency(getWatchTarget(product.id) || 0)}
              </span>
              <button
                onClick={() => removePriceWatch(product.id)}
                className="text-xs font-bold text-amber-800 hover:underline"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Marketplace Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-500" />
              <span>Express Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-indigo-500" />
              <span>7-Day Return Policy</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Verified Seller</span>
            </div>
          </div>
        </div>
      </div>

      {/* SIGNATURE FEATURE 1: BEST DEAL COMPARISON TABLE */}
      {product.dealsComparison && (
        <section className="pt-4">
          <BestDealComparison
            comparison={product.dealsComparison}
            onSelectAlternative={(altProductId) => {
              const altDeal = product.dealsComparison?.deals.find((d) => d.productId === altProductId);
              if (altDeal) {
                addToCart(altProductId, quantity);
              }
            }}
          />
        </section>
      )}

      {/* Description & Specs */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Product Details & Specifications</h3>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </section>

      {/* Ratings and Reviews Section */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Customer Ratings & Reviews</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real verified buyer feedback</p>
          </div>
          <div className="flex items-center gap-1.5 text-base font-black text-amber-500">
            <Star className="w-5 h-5 fill-amber-400" />
            <span>{product.rating > 0 ? product.rating.toFixed(1) : '5.0'} / 5.0</span>
          </div>
        </div>

        {/* Write a review form */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-600" /> Share Your Product Experience
            </h4>
            {user && reviewEligibility && (
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                reviewEligibility.canReview
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : reviewEligibility.alreadyReviewed
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {reviewEligibility.canReview
                  ? '✓ Verified Delivered Buyer — Eligible to Review'
                  : reviewEligibility.alreadyReviewed
                  ? '✓ You have already reviewed this product'
                  : '⚠ Verified Delivered Purchase Required to Review'}
              </span>
            )}
          </div>

          {!user ? (
            <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
              <p className="text-xs text-slate-600">Please sign in to share a review for this product.</p>
              <Link to="/login" className="mt-2 inline-block text-xs font-bold text-indigo-600 hover:underline">
                Sign In Now
              </Link>
            </div>
          ) : reviewEligibility?.alreadyReviewed ? (
            <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
              <p className="text-xs text-slate-600">You have already submitted a review for this product. Thank you for your feedback!</p>
            </div>
          ) : !reviewEligibility?.hasDeliveredOrder ? (
            <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
              <p className="text-xs text-slate-600">
                To guarantee genuine reviews, only customers who have purchased and received this product (DELIVERED status) can submit a review.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= reviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{reviewRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Your Review</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell others about product quality, value for money, and vendor delivery..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {rev.user.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{rev.user.name}</span>
                    {((rev as any).isVerifiedPurchase ?? true) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                <p className="text-[10px] text-slate-400">{formatDate(rev.createdAt)}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">
              No reviews yet. Be the first customer to share your thoughts!
            </p>
          )}
        </div>
      </section>

      {/* Price Watch Target Modal */}
      {showPriceWatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" /> Set Price Drop Alert
              </h3>
              <button
                onClick={() => setShowPriceWatchModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                We'll watch <strong>{product.title}</strong> and instantly alert you whenever the price falls to or below your target.
              </p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Current Price:</span>
                <span className="font-black text-slate-900">{formatCurrency(product.price)}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Price (₹)
                </label>
                <input
                  type="number"
                  value={targetPriceInput}
                  onChange={(e) => setTargetPriceInput(e.target.value)}
                  placeholder="e.g. 24000"
                  className="w-full text-sm font-bold p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPriceWatchModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = parseFloat(targetPriceInput);
                    if (isNaN(target) || target <= 0) {
                      error('Please enter a valid target price');
                      return;
                    }
                    if (target >= product.price) {
                      error(`Target price should be lower than the current price (${formatCurrency(product.price)})`);
                      return;
                    }
                    setPriceWatch(
                      {
                        id: product.id,
                        slug: product.slug,
                        title: product.title,
                        price: product.price,
                        image: product.images?.[0],
                      },
                      target
                    );
                    setShowPriceWatchModal(false);
                  }}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Activate Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
