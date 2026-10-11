import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock, Star, Store } from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar.js';
import { Vendor } from '../../types/index.js';
import { api } from '../../services/api.js';
import { formatDate, getTrustBadge } from '../../utils/formatters.js';
import { useToast } from '../../context/ToastContext.js';

export function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminVendors();
      setVendors(data || []);
    } catch (err: any) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleUpdateStatus = async (vendorId: string, status: string, storeName: string) => {
    try {
      await api.updateVendorStatus(vendorId, status);
      success(`${storeName} marked as ${status}!`);
      await loadVendors();
    } catch (err: any) {
      error(err.message || 'Failed to update vendor status');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-900 text-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto max-w-6xl">
        <div className="pb-4 border-b border-slate-800">
          <h1 className="text-2xl font-black text-white">Vendor Governance & Approvals</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review vendor applications, monitor seller trust scores, and approve/suspend merchant stores
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="bg-slate-800/80 rounded-3xl border border-slate-700/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-5">Store & Merchant</th>
                    <th className="py-3 px-5">Trust Score & Badge</th>
                    <th className="py-3 px-5">Orders Completed</th>
                    <th className="py-3 px-5">Application Status</th>
                    <th className="py-3 px-5 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {vendors.map((v) => {
                    const trust = getTrustBadge(v.trustScore);

                    return (
                      <tr key={v.id} className="hover:bg-slate-700/30">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-white shrink-0">
                              {v.storeName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-white block text-sm">{v.storeName}</span>
                              <span className="text-[11px] text-slate-400">
                                {v.user?.name} ({v.user?.email})
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1.5 font-bold text-amber-400">
                            <ShieldCheck className="w-4 h-4 text-amber-400" />
                            <span>{v.trustScore}%</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{trust.badgeLabel}</span>
                        </td>

                        <td className="py-4 px-5 font-bold text-slate-300">
                          {v.successfulOrders} Orders
                        </td>

                        <td className="py-4 px-5">
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              v.status === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : v.status === 'SUSPENDED' || v.status === 'REJECTED'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {v.status}
                            </span>
                            <button
                              onClick={async () => {
                                try {
                                  await api.updateVendorStatus(v.id, { isEcoFriendlyCertified: !v.isEcoFriendlyCertified });
                                  success(`Eco status updated for ${v.storeName}`);
                                  await loadVendors();
                                } catch (err: any) {
                                  error(err.message || 'Failed to update eco status');
                                }
                              }}
                              className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-all border ${
                                v.isEcoFriendlyCertified
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600 hover:bg-emerald-900'
                                  : 'bg-slate-800 text-slate-400 border-slate-600 hover:text-white'
                              }`}
                              title="Click to toggle admin eco-certification audit"
                            >
                              {v.isEcoFriendlyCertified ? '🌿 Eco-Certified' : '○ Not Certified'}
                            </button>
                          </div>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {v.status !== 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateStatus(v.id, 'APPROVED', v.storeName)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                              >
                                Approve
                              </button>
                            )}

                            {v.status !== 'SUSPENDED' && v.status === 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateStatus(v.id, 'SUSPENDED', v.storeName)}
                                className="px-2.5 py-1 bg-amber-600/80 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all"
                              >
                                Suspend
                              </button>
                            )}

                            {v.status !== 'REJECTED' && v.status !== 'SUSPENDED' && (
                              <button
                                onClick={() => handleUpdateStatus(v.id, 'REJECTED', v.storeName)}
                                className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-all"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
