import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Leaf, X, RotateCcw, AlertCircle } from 'lucide-react';
import { Product, Category, Vendor } from '../types/index.js';
import { api } from '../services/api.js';
import { ProductCard } from '../components/customer/ProductCard.js';
import { useComparison } from '../context/ComparisonContext.js';

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { comparedProducts, removeFromCompare, clearCompare } = useComparison();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filter states
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedVendor = searchParams.get('vendor') || '';
  const ecoFriendly = searchParams.get('ecoFriendly') === 'true';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, vends] = await Promise.all([
          api.getCategories(),
          api.getVendors(),
        ]);
        setCategories(cats || []);
        setVendors(vends || []);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    }
    loadMeta();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedVendor) params.vendor = selectedVendor;
      if (ecoFriendly) params.ecoFriendly = 'true';
      if (sort) params.sort = sort;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const data = await api.getProducts(params);
      setProducts(data.products || []);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setApiError(err.message || 'Unable to connect to marketplace service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const updateFilter = (key: string, value: string | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    Boolean(search || selectedCategory || selectedVendor || ecoFriendly || minPrice || maxPrice);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            {selectedCategory ? `${categories.find((c) => c.slug === selectedCategory)?.name || 'Category'} Catalog` : 'Marketplace Products'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Showing {products.length} products from verified vendors
          </p>
        </div>

        {/* Sort & Mobile filter trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-stone-200 rounded-xl"
          >
            <SlidersHorizontal className="w-4 h-4 text-stone-600" /> Filters
          </button>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-stone-500 hidden sm:inline">Sort by:</label>
            <select
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="text-xs font-semibold bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#b99373]"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="discount_desc">Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Filters sidebar + Product grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
        {/* Filters Sidebar */}
        <aside className={`md:block space-y-6 ${mobileFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-[#79563e]" /> Filter Catalog
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {/* Eco-Friendly Feature Filter */}
            <div>
              <label className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 cursor-pointer hover:bg-emerald-100/70 transition-colors">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900">Eco-Friendly Only</span>
                </div>
                <input
                  type="checkbox"
                  checked={ecoFriendly}
                  onChange={(e) => updateFilter('ecoFriendly', e.target.checked ? 'true' : null)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </label>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">Category</h4>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => updateFilter('category', null)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                    !selectedCategory ? 'bg-[#f1e7dc] text-[#654735] font-bold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilter('category', cat.slug)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-[#f1e7dc] text-[#654735] font-bold'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat._count?.products !== undefined && (
                      <span className="text-[10px] text-stone-400 font-semibold">{cat._count.products}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Vendors Filter */}
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">Verified Vendors</h4>
              <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto">
                <button
                  onClick={() => updateFilter('vendor', null)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                    !selectedVendor ? 'bg-[#f1e7dc] text-[#654735] font-bold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  All Sellers
                </button>
                {vendors.map((vend) => (
                  <button
                    key={vend.id}
                    onClick={() => updateFilter('vendor', vend.slug)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      selectedVendor === vend.slug
                        ? 'bg-[#f1e7dc] text-[#654735] font-bold'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className="truncate mr-1">{vend.storeName}</span>
                    <span className="text-[10px] text-emerald-600 font-bold shrink-0">{vend.trustScore}%</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">Price Range (₹)</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value || null)}
                  className="px-2.5 py-1.5 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#b99373]"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value || null)}
                  className="px-2.5 py-1.5 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#b99373]"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-3">
          {comparedProducts.length > 0 && (
            <section className="mb-6 rounded-2xl border border-[#e3d2c0] bg-[#f5ede4] p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#3b2a20]">Compare your shortlist</h2>
                  <p className="text-xs text-[#806b5a] mt-1">Select up to 3 listings to compare price, seller and ratings side by side.</p>
                </div>
                <button onClick={clearCompare} className="inline-flex items-center gap-1 rounded-full border border-[#d7c2ad] px-3 py-1.5 text-xs font-semibold text-[#72513b] hover:bg-white"><X className="h-3 w-3" /> Clear</button>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${comparedProducts.length}, minmax(0, 1fr))` }}>
                {comparedProducts.map((item) => (
                  <div key={item.id} className="min-w-0 rounded-xl border border-[#e8dbce] bg-white p-3">
                    <img src={item.images?.[0]} alt={item.title} className="mb-3 aspect-square w-full rounded-lg object-cover bg-[#f6f0e9]" />
                    <p className="line-clamp-2 min-h-9 text-xs font-semibold text-[#3b2a20]">{item.title}</p>
                    <p className="mt-2 text-lg font-bold text-[#3b2a20]">₹{item.price.toLocaleString('en-IN')}</p>
                    <div className="mt-3 space-y-2 border-t border-[#f0e7de] pt-3 text-[11px] text-[#725f50]">
                      <p><span className="font-semibold text-[#4a3428]">Seller:</span> {item.vendor.storeName}</p>
                      <p><span className="font-semibold text-[#4a3428]">Rating:</span> {item.rating.toFixed(1)} / 5 ({item.numReviews})</p>
                      <p><span className="font-semibold text-[#4a3428]">Stock:</span> {item.stock > 0 ? 'In stock' : 'Unavailable'}</p>
                      <p><span className="font-semibold text-[#4a3428]">Category:</span> {item.category.name}</p>
                    </div>
                    <button onClick={() => removeFromCompare(item.id)} className="mt-3 text-[11px] font-semibold text-[#8a6042] hover:underline">Remove</button>
                  </div>
                ))}
                {comparedProducts.length < 3 && <button onClick={() => document.getElementById('catalog-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-[#cdb8a4] bg-white/60 p-3 text-center text-xs text-[#806b5a]">Choose another product below</button>}
              </div>
            </section>
          )}
          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-stone-400 font-medium">Active filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
                  Keyword: "{search}"
                  <button onClick={() => updateFilter('search', null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f1e7dc] text-[#654735]">
                  Category: {selectedCategory}
                  <button onClick={() => updateFilter('category', null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedVendor && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f1e7dc] text-[#654735]">
                  Seller: {selectedVendor}
                  <button onClick={() => updateFilter('vendor', null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {ecoFriendly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                  Eco-Friendly
                  <button onClick={() => updateFilter('ecoFriendly', null)}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-stone-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : apiError ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-rose-200 p-8 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Service Temporarily Unavailable</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                {apiError}
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={fetchProducts}
                  className="px-5 py-2.5 bg-[#4a3428] hover:bg-[#634735] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retry Connection
                </button>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#f1e7dc] text-amber-500 mx-auto flex items-center justify-center">
                <SlidersHorizontal className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-800">No matching products found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try loosening your filters or search terms to see products across our multi-vendor catalog.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-[#4a3428] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#634735]"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div id="catalog-products" className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
