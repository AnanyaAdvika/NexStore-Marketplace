import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Leaf,
  ShoppingBag,
  TrendingUp,
  Percent,
  CheckCircle,
  Star,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Product, Category, Vendor, CompetitiveDealItem } from '../types/index.js';
import { api } from '../services/api.js';
import { ProductCard } from '../components/customer/ProductCard.js';
import { formatCurrency, getTrustBadge } from '../utils/formatters.js';
import { AuthEntryModal } from '../components/common/AuthEntryModal.js';
import { useAuth } from '../context/AuthContext.js';

export function Home() {
  const { user, loading: authLoading } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [bestDeals, setBestDeals] = useState<CompetitiveDealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Show entry modal on first visit without authenticated session
  const [showAuthModal, setShowAuthModal] = useState(() => {
    return !localStorage.getItem('token') && !sessionStorage.getItem('nexstore_entry_dismissed');
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const [featData, catData, vendData, dealsData] = await Promise.all([
        api.getFeaturedProducts(),
        api.getCategories(),
        api.getVendors(),
        api.getBestDeals(),
      ]);
      setFeaturedProducts(featData || []);
      setCategories(catData || []);
      setVendors(vendData || []);
      setBestDeals(dealsData || []);
    } catch (err: any) {
      console.error('Failed to load homepage data:', err);
      setApiError(err.message || 'Unable to load marketplace data. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-14 pb-20 bg-[#faf7f2]">
      {/* First-Visit Entry Modal */}
      <AuthEntryModal
        isOpen={showAuthModal && !user && !authLoading}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Backend Outage / Error Banner */}
      {apiError && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-800 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span><strong>Marketplace Connection Issue:</strong> {apiError}</span>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-1.5 bg-[#4a3428] hover:bg-[#634735] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry Request
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#eee3d6] text-[#33261f] rounded-[2rem] mx-4 sm:mx-6 lg:mx-8 mt-6 shadow-soft border border-[#e3d4c4]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#c9a889]/30 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 sm:py-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border border-[#d9c4ae] text-[#79563e] text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#9a704f]" />
              <span>Multi-Vendor Marketplace & Smart Deals</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.04] sm:leading-[1.02] font-editorial">
              Shop Smarter. <br />
              <span className="text-[#9a704f]">
                Compare Vendors.
              </span> <br />
              Save Instantly.
            </h1>

            <p className="text-base sm:text-lg text-[#6f5a4b] max-w-xl leading-relaxed">
              Why pay more when you can compare identical products from multiple verified sellers in real-time? Check seller trust scores, buy eco-friendly, and checkout from multiple vendors in one single cart.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/products"
                className="px-6 py-3.5 bg-[#4a3428] hover:bg-[#634735] text-white font-semibold text-sm rounded-full shadow-sm transition-all flex items-center gap-2 hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-4 h-4" /> Explore Marketplace
              </Link>
              <Link
                to="/products?ecoFriendly=true"
                className="px-6 py-3.5 bg-white/70 hover:bg-white text-[#5d6b4d] border border-[#d7dfcc] font-bold text-sm rounded-xl transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95"
              >
                <Leaf className="w-4 h-4 text-[#647653]" /> Eco-Friendly Deals
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#d9c7b5]">
              <div>
                <p className="text-2xl font-black text-[#33261f]">100%</p>
                <p className="text-xs text-[#8d796a]">Verified Vendors</p>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-400">₹2,900+</p>
                <p className="text-xs text-slate-400">Avg. Best Deal Savings</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400">One Cart</p>
                <p className="text-xs text-slate-400">Multi-Vendor Checkout</p>
              </div>
            </div>
          </div>

          {/* Hero Feature Visual: Live Best Deal Teaser Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#faf7f2]/90 backdrop-blur-xl border border-[#e4d7ca] rounded-[1.5rem] p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e5d9cc]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#9a704f] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Signature Feature Preview
                </div>
                <span className="text-[11px] bg-[#e6ecdf] text-[#586849] px-2.5 py-0.5 rounded-full font-semibold">
                  Live Deal Engine
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#eadfd4]/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#5f4b3c]">Sony WH-1000XM5 Headphones</span>
                  <span className="text-xs text-[#6c7a56] font-bold">Save ₹2,000</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#f8f3ed] border border-[#e9dfd4] text-[#887565]">
                    <span>Seller A: ElectroHub Direct</span>
                    <span className="line-through">₹26,990</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#edf1e8] border border-[#cdd7c1] text-[#4e6343] font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" /> Seller B: GadgetWorld Superstore
                    </span>
                    <span className="text-[#33261f] text-sm font-extrabold">₹24,990</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#f1e7dc] border border-[#e3d2c0] rounded-xl text-xs text-[#715541] flex items-center justify-between">
                <span>💡 In Cart: Smart Savings auto-suggests cheaper alternatives.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-[#33261f]">Explore by Category</h2>
            <p className="text-sm text-slate-500 mt-1">Browse multi-vendor collections tailored to your lifestyle</p>
          </div>
          <Link to="/products" className="text-sm font-bold text-[#79563e] hover:text-[#4a3428] flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-[1.35rem] border border-[#e9dfd4] bg-white p-4 hover:shadow-soft hover:border-[#cdb59e] transition-all duration-300"
            >
              <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-slate-100">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&auto=format&fit=crop&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-bold text-[#33261f] group-hover:text-[#8a6042] transition-colors text-sm">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* SIGNATURE FEATURE: Live Best Deals Showcase */}
      {bestDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#f1e7dc] border border-[#e2d0be] rounded-[1.75rem] p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#9a704f] text-white flex items-center justify-center shadow-lg shadow-amber-200">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      Best Deal Comparison Spotlight
                    </h2>
                    <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase bg-[#9a704f] text-white rounded-full">
                      Guaranteed Cheapest
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#725f50] mt-0.5">
                    Identical products offered by different approved sellers. NexStore highlights the cheapest deal!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {bestDeals.map((deal) => (
                <div
                  key={deal.groupName}
                  className="bg-white rounded-2xl p-5 border border-amber-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-semibold text-[#79563e]">{deal.category}</span>
                      <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">
                        {deal.totalVendorsCompeting} Sellers Competing
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                      {deal.title}
                    </h3>

                    {/* Price Difference Box */}
                    <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Highest Seller Price:</span>
                        <span className="line-through text-slate-400 font-medium">
                          {formatCurrency(deal.highestPrice)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700">Cheapest Verified Offer:</span>
                        <span className="text-base font-black text-emerald-700">
                          {formatCurrency(deal.cheapestPrice)}
                        </span>
                      </div>
                      <div className="pt-1.5 border-t border-amber-200/50 flex items-center justify-between text-[11px] font-extrabold text-amber-800">
                        <span>Instant Savings:</span>
                        <span>Save {formatCurrency(deal.maxSavings)} ({deal.savingsPercent}% off)</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                      <span>Sold by: <strong className="text-slate-800">{deal.cheapestVendor.storeName}</strong></span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> {deal.cheapestVendor.trustMetrics.trustScore}% Trust
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/products/${deal.cheapestProduct.slug}`}
                    className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Compare Sellers & Buy <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" /> Trending in Catalog
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Featured Marketplace Items</h2>
          </div>
          <Link to="/products" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Browse All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Verified Vendors Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Verified Marketplace Merchants
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Shop with Top-Rated Sellers
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Every merchant undergoes strict quality audits and is rated by our algorithmic Trust Score.
              </p>
            </div>
            <Link
              to="/signup?role=VENDOR"
              className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl transition-all self-start md:self-auto shrink-0"
            >
              Apply as a Vendor
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vendors.map((vendor) => {
              const trust = getTrustBadge(vendor.trustScore);

              return (
                <div
                  key={vendor.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-700 overflow-hidden shrink-0 border border-slate-600">
                        <img
                          src={vendor.logo || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=150'}
                          alt={vendor.storeName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${trust.bgClass} ${trust.colorClass}`}>
                          {vendor.trustScore}% Trust
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-white text-base">{vendor.storeName}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {vendor.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-700 grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Rating:</span>
                        <span className="font-bold text-amber-400 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {vendor.rating.toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Fulfillment:</span>
                        <span className="font-bold text-emerald-400">
                          {vendor.successfulOrders} Orders
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/products?vendor=${vendor.slug}`}
                    className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs rounded-xl text-center transition-colors"
                  >
                    View Store Products
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
