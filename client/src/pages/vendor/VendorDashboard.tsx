import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { VendorSidebar } from '../../components/vendor/VendorSidebar.js';
import { api } from '../../services/api.js';
import { formatCurrency, formatDate, getTrustBadge } from '../../utils/formatters.js';

export function VendorDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await api.getVendorAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load vendor analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <VendorSidebar />
        <div className="flex-1 p-10 flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const vendor = data?.vendor || {};
  const trustMetrics = vendor.trustMetrics || {};
  const trustBadge = getTrustBadge(vendor.trustScore || 85);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <VendorSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto max-w-6xl">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Merchant Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Performance metrics and order management for {vendor.storeName}
            </p>
          </div>

          <Link
            to="/vendor/products/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm self-start sm:self-auto transition-all"
          >
            + Add New Product
          </Link>
        </div>

        {/* Application Status Notice */}
        {vendor.status === 'PENDING' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 space-y-1">
              <p className="font-bold text-sm text-amber-900">Store Application Status: PENDING REVIEW</p>
              <p>Your seller registration is currently under review by the NexStore marketplace admin team. While pending, you can explore the dashboard and prepare product listings. Your products will become visible to marketplace buyers once an admin approves your store.</p>
            </div>
          </div>
        )}

        {vendor.status === 'SUSPENDED' && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800 space-y-1">
              <p className="font-bold text-sm text-rose-900">Store Status: SUSPENDED</p>
              <p>Your store has been temporarily suspended by the marketplace administrator. Please review your fulfillment metrics and contact support.</p>
            </div>
          </div>
        )}

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Total Earnings
            </span>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(stats.totalRevenue || 0)}</p>
            <span className="text-[10px] text-slate-400">Net after 5% marketplace fee</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-indigo-600" /> Total Sub-Orders
            </span>
            <p className="text-2xl font-black text-slate-900">{stats.totalOrders || 0}</p>
            <span className="text-[10px] text-indigo-600 font-semibold">{stats.pendingOrders || 0} pending fulfillment</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-violet-600" /> Live Catalog Items
            </span>
            <p className="text-2xl font-black text-slate-900">{stats.totalProducts || 0}</p>
            <span className="text-[10px] text-slate-400">Active products in store</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-500" /> Vendor Trust Score
            </span>
            <p className="text-2xl font-black text-amber-600">{vendor.trustScore || 85}%</p>
            <span className={`text-[10px] font-bold ${trustBadge.colorClass}`}>{trustBadge.badgeLabel}</span>
          </div>
        </div>

        {/* SIGNATURE FEATURE 4: VENDOR TRUST SCORE BREAKDOWN CARD */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border-2 border-amber-300 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Trust Score & Seller Health Breakdown
                </h3>
                <p className="text-xs text-slate-600">
                  Calculated dynamically from real-time fulfillments, cancellations, customer ratings, and on-time delivery.
                </p>
              </div>
            </div>

            <div className="bg-white px-4 py-2 rounded-2xl border border-amber-300 shadow-xs text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
              <span className={`text-xs font-extrabold ${trustBadge.colorClass}`}>
                ★ {trustBadge.badgeLabel} ({vendor.trustScore}%)
              </span>
            </div>
          </div>

          {/* 4 Factor Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-600">Customer Ratings Factor</span>
                <span className="text-slate-900">{trustMetrics.ratingScore || 38} / 40 pts</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{ width: `${((trustMetrics.ratingScore || 38) / 40) * 100}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-400">Based on verified buyer reviews</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-600">Fulfillment Success</span>
                <span className="text-slate-900">{trustMetrics.fulfillmentRate || 98}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${trustMetrics.fulfillmentRate || 98}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-400">Orders completed without cancellation</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-600">On-Time Dispatch</span>
                <span className="text-slate-900">{trustMetrics.onTimeRate || 96}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{ width: `${trustMetrics.onTimeRate || 96}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-400">Shipped within 24h SLA</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {data.lowStockProducts && data.lowStockProducts.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">Low Stock Notice</h4>
                <p className="text-xs text-amber-800">
                  {data.lowStockProducts.length} item(s) have 5 or fewer units left in inventory.
                </p>
              </div>
            </div>
            <Link
              to="/vendor/products"
              className="text-xs font-bold text-amber-900 underline shrink-0 hover:text-amber-950"
            >
              Update Stock
            </Link>
          </div>
        )}

        {/* Recent Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recent Customer Sub-Orders</h3>
            <Link to="/vendor/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4">Master Order ID</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Earnings</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentOrders?.map((vo: any) => (
                  <tr key={vo.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      {vo.order?.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(vo.createdAt)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(vo.vendorEarnings)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {vo.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to="/vendor/orders"
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        Fulfill Order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
