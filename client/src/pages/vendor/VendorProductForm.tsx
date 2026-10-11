import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Leaf, Image as ImageIcon } from 'lucide-react';
import { VendorSidebar } from '../../components/vendor/VendorSidebar.js';
import { Category } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';

export function VendorProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    description: '',
    price: '',
    compareAtPrice: '',
    discountPercent: '0',
    stock: '',
    imageUrl: '',
    sku: '',
    catalogGroup: '',
    isEcoFriendly: false,
    ecoDetails: '',
    isFeatured: false,
  });

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const cats = await api.getCategories();
        setCategories(cats || []);

        if (isEditing && id) {
          const product = await api.getProduct(id);
          setFormData({
            title: product.title,
            categoryId: product.categoryId,
            description: product.description,
            price: product.price.toString(),
            compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toString() : '',
            discountPercent: product.discountPercent.toString(),
            stock: product.stock.toString(),
            imageUrl: Array.isArray(product.images) ? product.images.join('\n') : product.images || '',
            sku: product.sku || '',
            catalogGroup: product.catalogGroup || '',
            isEcoFriendly: product.isEcoFriendly,
            ecoDetails: product.ecoDetails || '',
            isFeatured: product.isFeatured,
          });
        } else if (cats && cats.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: cats[0].id }));
        }
      } catch (err: any) {
        console.error('Failed to init product form:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.stock || !formData.categoryId) {
      error('Please complete all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const parsedImages = formData.imageUrl
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title,
        categoryId: formData.categoryId,
        description: formData.description || 'Premium quality product verified by vendor.',
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        discountPercent: parseFloat(formData.discountPercent) || 0,
        stock: parseInt(formData.stock),
        images: parsedImages.length > 0 ? parsedImages : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
        sku: formData.sku || undefined,
        catalogGroup: formData.catalogGroup || undefined,
        isEcoFriendly: formData.isEcoFriendly,
        ecoDetails: formData.isEcoFriendly ? formData.ecoDetails : null,
        isFeatured: formData.isFeatured,
      };

      if (isEditing && id) {
        await api.updateVendorProduct(id, payload);
        success('Product updated successfully!');
      } else {
        await api.createVendorProduct(payload);
        success('Product published to marketplace successfully!');
      }

      navigate('/vendor/products');
    } catch (err: any) {
      error(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <VendorSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto max-w-4xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <Link
              to="/vendor/products"
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
            </Link>
            <h1 className="text-2xl font-black text-slate-900">
              {isEditing ? 'Edit Product' : 'Add New Marketplace Product'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
              Basic Product Information
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Sony WH-1000XM5 Wireless Headphones (Midnight Blue)"
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SKU (Inventory Identifier)</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. AUDIO-SONY-XM5-BLU"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe key features, warranty, box contents and specifications..."
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
              Pricing & Stock Levels
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="24990"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Original / Compare Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.compareAtPrice}
                  onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                  placeholder="34990"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Available Stock (Units) *</label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="25"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>
          </div>

          {/* SIGNATURE FEATURE 1: BEST DEAL GROUPING */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Signature Feature: Best Deal Comparison Grouping
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              If other vendors also sell this exact item, use an identical Catalog Group slug (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">sony-wh1000xm5</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">apple-iphone-15-pro-128</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">macbook-air-m3</code>). Buyers will see you in the live Best Deal Comparison table!
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catalog Group Identifier (Optional)</label>
              <input
                type="text"
                value={formData.catalogGroup}
                onChange={(e) => setFormData({ ...formData, catalogGroup: e.target.value })}
                placeholder="e.g. sony-wh1000xm5"
                className="w-full text-xs p-3 border border-amber-200 rounded-xl bg-amber-50/20 font-mono"
              />
            </div>
          </div>

          {/* SIGNATURE FEATURE 5: ECO-FRIENDLY OPTION */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Eco-Friendly & Sustainable Product Options
              </h3>
            </div>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isEcoFriendly}
                onChange={(e) => setFormData({ ...formData, isEcoFriendly: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-xs font-bold text-emerald-900">
                Mark this product as Eco-Friendly (biodegradable packaging, carbon-neutral, zero plastic)
              </span>
            </label>

            {formData.isEcoFriendly && (
              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">Eco Certification Details</label>
                <input
                  type="text"
                  value={formData.ecoDetails}
                  onChange={(e) => setFormData({ ...formData, ecoDetails: e.target.value })}
                  placeholder="e.g. 100% Recycled packaging, FSC Certified, plastic-free shipping"
                  className="w-full text-xs p-3 border border-emerald-300 rounded-xl bg-white"
                />
              </div>
            )}
          </div>

          {/* Product Image URL */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
              Media & Images
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Photo URLs (One URL per line)</label>
              <textarea
                rows={3}
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder={`https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800\nhttps://images.unsplash.com/photo-1484704849700-f032a568e944?w=800`}
                className="w-full p-3 text-xs border border-slate-200 rounded-xl font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tip: Paste one or multiple direct image URLs. The first image will serve as the primary catalogue cover.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/vendor/products"
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Publish Product'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
