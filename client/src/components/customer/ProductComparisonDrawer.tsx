import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Check, ArrowRight, ShieldCheck, Star, ShoppingBag, BarChart2 } from 'lucide-react';
import { useComparison } from '../../context/ComparisonContext.js';
import { formatCurrency, getTrustBadge } from '../../utils/formatters.js';
import { useCart } from '../../context/CartContext.js';

export function ProductComparisonDrawer() {
  const { comparedProducts, removeFromCompare, clearCompare } = useComparison();
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  if (comparedProducts.length === 0) return null;

  return (
    <>
      {/* Floating Bar Trigger */}
      <div className="fixed bottom-5 right-5 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700 animate-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-bold">
            Compare ({comparedProducts.length}/3 items)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            View Comparison
          </button>
          <button
            onClick={clearCompare}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Clear all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal / Drawer for Comparison */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-6 h-6 text-indigo-600" /> Product Comparison Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Side-by-side spec and price evaluation (up to 3 products)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearCompare}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Comparison Table Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {/* Row: Remove & Thumbnail */}
                  <tr className="border-b border-slate-100">
                    <td className="py-4 px-3 text-xs font-bold text-slate-400 uppercase w-32">Product</td>
                    {comparedProducts.map((item) => (
                      <td key={item.id} className="py-4 px-3 w-72 align-top">
                        <div className="space-y-3 relative">
                          <button
                            onClick={() => removeFromCompare(item.id)}
                            className="absolute -top-2 -right-2 p-1 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-full transition-colors"
                            title="Remove product"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-24 h-24 rounded-2xl bg-slate-50 overflow-hidden border border-slate-200 mx-auto">
                            <img
                              src={item.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Link
                            to={`/products/${item.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="block font-bold text-xs text-slate-900 hover:text-indigo-600 text-center line-clamp-2"
                          >
                            {item.title}
                          </Link>
                        </div>
                      </td>
                    ))}
                    {[...Array(3 - comparedProducts.length)].map((_, idx) => (
                      <td key={`empty-${idx}`} className="py-4 px-3 w-72 text-center align-middle bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400 font-medium">Empty comparison slot</p>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Price */}
                  <tr className="border-b border-slate-100 bg-slate-50/30">
                    <td className="py-3 px-3 text-xs font-bold text-slate-500">Price</td>
                    {comparedProducts.map((item) => (
                      <td key={item.id} className="py-3 px-3">
                        <span className="text-base font-black text-slate-900">
                          {formatCurrency(item.price)}
                        </span>
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <span className="text-xs text-slate-400 line-through ml-2">
                            {formatCurrency(item.compareAtPrice)}
                          </span>
                        )}
                      </td>
                    ))}
                    {[...Array(3 - comparedProducts.length)].map((_, idx) => (
                      <td key={`empty-p-${idx}`} className="py-3 px-3" />
                    ))}
                  </tr>

                  {/* Row: Discount & Estimated Savings */}
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-3 text-xs font-bold text-slate-500">Savings & Discount</td>
                    {comparedProducts.map((item) => {
                      const maxPrice = Math.max(...comparedProducts.map((p) => p.price));
                      const savingsVsOther = maxPrice - item.price;
                      return (
                        <td key={item.id} className="py-3 px-3 text-xs">
                          {savingsVsOther > 0 ? (
                            <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                              Save {formatCurrency(savingsVsOther)} vs others!
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">
                              {item.discountPercent > 0 ? `${item.discountPercent}% store discount` : 'Regular Price'}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    {[...Array(3 - comparedProducts.length)].map((_, idx) => (
                      <td key={`empty-sav-${idx}`} className="py-3 px-3" />
                    ))}
                  </tr>

                  {/* Row: Shipping Estimate */}
                  <tr className="border-b border-slate-100 bg-slate-50/30">
                    <td className="py-3 px-3 text-xs font-bold text-slate-500">Shipping</td>
                    {comparedProducts.map((item) => (
                      <td key={item.id} className="py-3 px-3 text-xs">
                        <span className="text-slate-700 font-medium">
                          {item.price >= 1000 ? 'Free Shipping (2-3 business days)' : 'Standard Delivery ₹50 (3-4 days)'}
                        </span>
                      </td>
                    ))}
                    {[...Array(3 - comparedProducts.length)].map((_, idx) => (
                      <td key={`empty-ship-${idx}`} className="py-3 px-3" />
                    ))}
                  </tr>

                  {/* Row: Vendor & Trust */}
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-3 text-xs font-bold text-slate-500">Seller & Trust</td>
                    {comparedProducts.map((item) => {
                      const badge = getTrustBadge(item.vendor.trustScore);
                      return (
                        <td key={item.id} className="py-3 px-3 text-xs">
                          <p className="font-bold text-slate-900">{item.vendor.storeName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`font-semibold ${badge.colorClass}`}>
                              {badge.badgeLabel}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600 font-bold">{item.vendor.trustScore}% Score</span>
                          </div>
                        </td>
                      );
                    })}
                    {[...Array(3 - comparedProducts.length)].map((_, idx) => (
                      <td key={`empty-v-${idx}`} className="py-3 px-3" />
                    ))}
                  </tr>

                  {/* Row: Customer Rating */}
                  <tr className="border-b border-slate-100 bg-slate-50/30">
                    <td className="py-3 px-3 text-xs font-bold text-slate-500">Rating</td>
                    {comparedProducts.map((item) => (
                      <td key={item.id} className="py-3 px-3">
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{item.rating > 0 ? item.rating.toFixed(1) : '4.8'}</span>
                          <span className="text-slate-400 font-normal">({item.numReviews} reviews)</span>
                        </div>
                      </td>
                    ))}
                    {[...Array(3 - comparedProducts.length)].map((_, idx) => (
                      <td key={`empty-r-${idx}`} className="py-3 px-3" />
                    ))}
                  </tr>

                  {/* Row: Eco-Friendly */}
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-3 text-xs font-bold text-slate-500">Eco-Friendly</td>
                    {comparedProducts.map((item) => (
                      <td key={item.id} className="py-3 px-3 text-xs">
                        {item.isEcoFriendly ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Certified Green
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">Standard</span>
                        )}
                      </td>
                    ))}
                    {[...Array(3 - comparedProducts.length)].map((_, idx) => (
                      <td key={`empty-e-${idx}`} className="py-3 px-3" />
                    ))}
                  </tr>

                  {/* Row: Stock & Availability */}
                  <tr className="border-b border-slate-100 bg-slate-50/30">
                    <td className="py-3 px-3 text-xs font-bold text-slate-500">Availability</td>
                    {comparedProducts.map((item) => (
                      <td key={item.id} className="py-3 px-3 text-xs">
                        {item.stock > 0 ? (
                          <span className="text-emerald-600 font-semibold">In Stock ({item.stock} units)</span>
                        ) : (
                          <span className="text-rose-500 font-bold">Out of stock</span>
                        )}
                      </td>
                    ))}
                    {[...Array(3 - comparedProducts.length)].map((_, idx) => (
                      <td key={`empty-s-${idx}`} className="py-3 px-3" />
                    ))}
                  </tr>

                  {/* Row: Action */}
                  <tr>
                    <td className="py-4 px-3 text-xs font-bold text-slate-500">Action</td>
                    {comparedProducts.map((item) => (
                      <td key={item.id} className="py-4 px-3">
                        <button
                          onClick={() => {
                            addToCart(item.id, 1);
                            setIsOpen(false);
                          }}
                          disabled={item.stock <= 0}
                          className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                        </button>
                      </td>
                    ))}
                    {[...Array(3 - comparedProducts.length)].map((_, idx) => (
                      <td key={`empty-a-${idx}`} className="py-4 px-3" />
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
