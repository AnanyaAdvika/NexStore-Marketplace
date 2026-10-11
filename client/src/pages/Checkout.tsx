import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CreditCard,
  MapPin,
  CheckCircle,
  Truck,
  ArrowRight,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Address } from '../types/index.js';
import { api } from '../services/api.js';
import { formatCurrency } from '../utils/formatters.js';

export function Checkout() {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'DEMO_PAYMENT' | 'COD'>('DEMO_PAYMENT');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // New Address form toggle & state
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const couponCode = (location.state as any)?.couponCode || '';

  useEffect(() => {
    async function loadAddresses() {
      try {
        const addrs = await api.getAddresses();
        setAddresses(addrs || []);
        if (addrs && addrs.length > 0) {
          const defaultAddr = addrs.find((a: Address) => a.isDefault) || addrs[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowNewAddress(true);
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      }
    }
    loadAddresses();
  }, []);

  if (!cart || cart.vendorGroups.length === 0) {
    navigate('/cart');
    return null;
  }

  const shippingFee = cart.grandSubtotal > 1000 ? 0 : 50;
  // If coupon passed, mock estimate
  const discount = couponCode === 'WELCOME10' ? Math.round(cart.grandSubtotal * 0.1) : couponCode === 'MEGA500' ? 500 : 0;
  const totalAmount = Math.max(0, cart.grandSubtotal - discount + shippingFee);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId && (!newAddress.street || !newAddress.city)) {
      error('Please select or provide a delivery address');
      return;
    }

    if (paymentMethod === 'DEMO_PAYMENT' && simulateFailure) {
      error('Simulated Payment Declined: Test card or account has insufficient test funds. Uncheck failure test to simulate success.');
      return;
    }

    try {
      setIsPlacingOrder(true);
      const payload: any = {
        paymentMethod: paymentMethod === 'DEMO_PAYMENT' ? 'DEMO_SIMULATED' : 'COD',
        couponCode: couponCode || undefined,
      };

      if (selectedAddressId) {
        payload.addressId = selectedAddressId;
      } else {
        payload.newAddress = newAddress;
      }

      const order = await api.createOrder(payload);

      // Fire celebratory confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      success('Order placed successfully! Vendors notified for fulfillment.');
      await fetchCart();
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      error(err.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Checkout & Order Splitting
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your items from {cart.vendorGroups.length} vendors. Single unified payment.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Address and Payment */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Delivery Address */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" /> 1. Shipping Address
              </h2>
              <button
                type="button"
                onClick={() => setShowNewAddress(!showNewAddress)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Address
              </button>
            </div>

            {/* Saved Addresses List */}
            {addresses.length > 0 && !showNewAddress && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      selectedAddressId === addr.id
                        ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-600/30'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{addr.fullName}</span>
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="w-4 h-4 text-indigo-600"
                        />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Phone: {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* New Address Form */}
            {showNewAddress && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Enter Shipping Address Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-medium mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">State & PIN Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="State"
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="w-1/2 p-2 border border-slate-200 rounded-xl bg-white"
                      />
                      <input
                        type="text"
                        placeholder="PIN"
                        required
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        className="w-1/2 p-2 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Payment Method */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#79563e]" /> 2. Select Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'DEMO_PAYMENT'
                    ? 'bg-[#f5ede3] border-[#79563e] ring-2 ring-[#79563e]/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#9a704f]" /> Demo Payment
                    </span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="DEMO_PAYMENT"
                      checked={paymentMethod === 'DEMO_PAYMENT'}
                      onChange={() => setPaymentMethod('DEMO_PAYMENT' as any)}
                      className="w-4 h-4 text-[#79563e]"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 block mt-1">
                    SIMULATED — no real money is charged
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Instant sandbox payment simulation with automated receipt. No credit card or banking details required.
                  </p>
                </div>

                {paymentMethod === 'DEMO_PAYMENT' && (
                  <div className="mt-3 pt-2 border-t border-[#dfcebc]">
                    <label className="flex items-center gap-2 text-[11px] text-rose-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simulateFailure}
                        onChange={(e) => setSimulateFailure(e.target.checked)}
                        className="rounded text-rose-600"
                      />
                      <span>Test Failure Simulation (declines transaction)</span>
                    </label>
                  </div>
                )}
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'COD'
                    ? 'bg-[#f5ede3] border-[#79563e] ring-2 ring-[#79563e]/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-slate-600" /> Cash on Delivery
                    </span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD' as any)}
                      className="w-4 h-4 text-[#79563e]"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">Pay upon package delivery</span>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Pay delivery executive in cash upon arrival of your packages.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Splitting Breakdown & Place Order */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
              Multi-Vendor Package Split
            </h3>

            {/* Split breakdown */}
            <div className="space-y-3">
              {cart.vendorGroups.map((group, idx) => (
                <div key={group.vendor.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>Package {idx + 1}: {group.vendor.storeName}</span>
                    <span>{formatCurrency(group.subtotal)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {group.items.length} item(s) • Handled directly by seller
                  </p>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(cart.grandSubtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-bold">
                  <span>Coupon Applied ({couponCode})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-emerald-600">
                  {shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between text-slate-900">
                <span className="text-sm font-extrabold">Final Payable</span>
                <span className="text-2xl font-black text-indigo-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPlacingOrder}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {isPlacingOrder ? 'Processing...' : `Place Unified Order (${formatCurrency(totalAmount)})`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
