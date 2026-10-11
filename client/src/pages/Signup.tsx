import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, User, Phone, Store, Leaf, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

export function Signup() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'VENDOR' ? 'VENDOR' : 'CUSTOMER';

  const [role, setRole] = useState<'CUSTOMER' | 'VENDOR'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [isEcoFriendlyCertified, setIsEcoFriendlyCertified] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      error('Please complete required fields');
      return;
    }

    if (role === 'VENDOR' && !storeName) {
      error('Please provide your Store Name');
      return;
    }

    try {
      setLoading(true);
      const user = await register({
        name,
        email,
        password,
        phone,
        role,
        storeName: role === 'VENDOR' ? storeName : undefined,
        storeDescription: role === 'VENDOR' ? storeDescription : undefined,
        isEcoFriendlyCertified: role === 'VENDOR' ? isEcoFriendlyCertified : false,
      });

      success(`Welcome to NexStore, ${user.name}!`);
      const redirect = searchParams.get('redirect');
      if (user.role === 'VENDOR') {
        navigate('/vendor/dashboard');
      } else {
        navigate(redirect || '/');
      }
    } catch (err: any) {
      error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900">NexStore</span>
          </Link>
          <h2 className="text-xl font-extrabold text-slate-900">Create your account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Join our transparent, multi-vendor commerce ecosystem
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`py-2.5 rounded-xl transition-all ${
              role === 'CUSTOMER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            I am a Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('VENDOR')}
            className={`py-2.5 rounded-xl transition-all ${
              role === 'VENDOR' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            I am a Vendor / Seller
          </button>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Vendor Specific Fields */}
          {role === 'VENDOR' && (
            <div className="pt-3 border-t border-slate-100 space-y-4">
              <div>
                <label className="block text-xs font-bold text-indigo-900 mb-1">Store / Brand Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Apex Electronics, Green Earth"
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50/20"
                  />
                  <Store className="w-4 h-4 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-900 mb-1">Store Description</label>
                <textarea
                  rows={2}
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="Tell buyers what makes your catalog special..."
                  className="w-full p-2.5 text-xs border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50/20"
                />
              </div>

              {/* Eco-Friendly Vendor Certification Option */}
              <label className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEcoFriendlyCertified}
                  onChange={(e) => setIsEcoFriendlyCertified(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <div className="text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Eco-Friendly Certified Merchant
                  </span>
                  <span className="text-[11px] text-emerald-700 block mt-0.5">
                    Products qualify for eco badges and green search filters.
                  </span>
                </div>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Creating account...' : role === 'VENDOR' ? 'Register Store' : 'Create Customer Account'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="text-center pt-2 text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
