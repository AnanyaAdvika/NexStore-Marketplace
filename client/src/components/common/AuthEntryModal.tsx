import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Lock,
  Mail,
  User,
  Phone,
  Store,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

interface AuthEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string | null;
}

type TabType = 'LOGIN' | 'CUSTOMER_SIGNUP' | 'VENDOR_SIGNUP';

export function AuthEntryModal({ isOpen, onClose, redirectUrl }: AuthEntryModalProps) {
  const [tab, setTab] = useState<TabType>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('nexstore_entry_dismissed', 'true');
    onClose();
  };

  const handlePostAuth = (authUser: any) => {
    sessionStorage.setItem('nexstore_entry_dismissed', 'true');
    onClose();
    if (redirectUrl) {
      navigate(redirectUrl);
    } else if (authUser.role === 'VENDOR') {
      navigate('/vendor/dashboard');
    } else if (authUser.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password');
      return;
    }
    try {
      setLoading(true);
      const user = await login({ email, password });
      success(`Welcome back, ${user.name}!`);
      handlePostAuth(user);
    } catch (err: any) {
      error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      error('Please fill in required fields');
      return;
    }
    try {
      setLoading(true);
      const user = await register({
        name,
        email,
        password,
        phone,
        role: 'CUSTOMER',
      });
      success(`Welcome to NexStore, ${user.name}!`);
      handlePostAuth(user);
    } catch (err: any) {
      error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVendorSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !storeName) {
      error('Please provide name, email, password, and store name');
      return;
    }
    try {
      setLoading(true);
      const user = await register({
        name,
        email,
        password,
        phone,
        role: 'VENDOR',
        storeName,
        storeDescription,
        isEcoFriendlyCertified: false,
      });
      success(`Store application submitted! Awaiting administrator approval.`);
      handlePostAuth(user);
    } catch (err: any) {
      error(err.message || 'Vendor registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    try {
      setLoading(true);
      const user = await login({ email: demoEmail, password: 'password123' });
      success(`Logged in as ${demoRole}!`);
      handlePostAuth(user);
    } catch (err: any) {
      error(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-[#faf7f2] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#e3d4c4] space-y-6 my-8 relative">
        {/* Close / Guest Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#ede2d5] transition-colors"
          title="Explore as Guest"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#d9c4ae] text-[#79563e] text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#9a704f]" />
            <span>Welcome to NexStore Marketplace</span>
          </div>
          <h2 className="text-2xl font-black text-[#33261f]">
            {tab === 'LOGIN'
              ? 'Sign in to Your Account'
              : tab === 'CUSTOMER_SIGNUP'
              ? 'Join as a Customer'
              : 'Apply to Sell on NexStore'}
          </h2>
          <p className="text-xs text-[#7c6656] max-w-sm mx-auto">
            Compare vendor pricing, access smart cart savings, and shop verified multi-seller deals.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 p-1 bg-[#ede3d6] rounded-2xl text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => setTab('LOGIN')}
            className={`py-2 rounded-xl transition-all ${
              tab === 'LOGIN' ? 'bg-white text-[#33261f] shadow-xs' : 'text-[#7c6656] hover:text-[#33261f]'
            }`}
          >
            Customer Login
          </button>
          <button
            type="button"
            onClick={() => setTab('CUSTOMER_SIGNUP')}
            className={`py-2 rounded-xl transition-all ${
              tab === 'CUSTOMER_SIGNUP' ? 'bg-white text-[#33261f] shadow-xs' : 'text-[#7c6656] hover:text-[#33261f]'
            }`}
          >
            Customer Signup
          </button>
          <button
            type="button"
            onClick={() => setTab('VENDOR_SIGNUP')}
            className={`py-2 rounded-xl transition-all ${
              tab === 'VENDOR_SIGNUP' ? 'bg-white text-[#4a3428] shadow-xs' : 'text-[#7c6656] hover:text-[#33261f]'
            }`}
          >
            Vendor Signup
          </button>
        </div>

        {/* Tab 1: Login Form & 1-Click Demo Logins */}
        {tab === 'LOGIN' && (
          <div className="space-y-4">
            {/* Quick Demo Accounts */}
            <div className="bg-[#f2e7db] rounded-2xl p-3.5 border border-[#dfcebc] space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#634735] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#9a704f]" /> 1-Click Demo Accounts (Instant Testing)
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('customer@example.com', 'Customer')}
                  className="p-2 bg-white hover:bg-stone-50 border border-[#dfcebc] rounded-xl text-left font-semibold text-stone-800 flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="block text-[11px] leading-tight font-bold">Customer</span>
                    <span className="text-[9px] text-stone-500 font-normal">Priya Sharma</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('vendor1@example.com', 'Vendor 1')}
                  className="p-2 bg-white hover:bg-stone-50 border border-[#dfcebc] rounded-xl text-left font-semibold text-stone-800 flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Store className="w-4 h-4 text-[#9a704f] shrink-0" />
                  <div>
                    <span className="block text-[11px] leading-tight font-bold">Vendor 1</span>
                    <span className="text-[9px] text-stone-500 font-normal">ElectroHub</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('vendor2@example.com', 'Vendor 2')}
                  className="p-2 bg-white hover:bg-stone-50 border border-[#dfcebc] rounded-xl text-left font-semibold text-stone-800 flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Store className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="block text-[11px] leading-tight font-bold">Vendor 2</span>
                    <span className="text-[9px] text-stone-500 font-normal">GadgetWorld</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin@example.com', 'Admin')}
                  className="p-2 bg-white hover:bg-stone-50 border border-[#dfcebc] rounded-xl text-left font-semibold text-stone-800 flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <span className="block text-[11px] leading-tight font-bold">Admin</span>
                    <span className="text-[9px] text-stone-500 font-normal">Administrator</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Standard Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3 bg-white p-5 rounded-2xl border border-[#e4d7ca]">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a704f] bg-[#faf7f2]/50"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a704f] bg-[#faf7f2]/50"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#4a3428] hover:bg-[#634735] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Customer Signup Form */}
        {tab === 'CUSTOMER_SIGNUP' && (
          <form onSubmit={handleCustomerSignupSubmit} className="space-y-3 bg-white p-5 rounded-2xl border border-[#e4d7ca]">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Priya Sharma"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a704f] bg-[#faf7f2]/50"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a704f] bg-[#faf7f2]/50"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a704f] bg-[#faf7f2]/50"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a704f] bg-[#faf7f2]/50"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#4a3428] hover:bg-[#634735] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Creating account...' : 'Create Customer Account'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Tab 3: Vendor Application Form */}
        {tab === 'VENDOR_SIGNUP' && (
          <form onSubmit={handleVendorSignupSubmit} className="space-y-3 bg-white p-5 rounded-2xl border border-[#e4d7ca]">
            <div className="p-2.5 bg-[#f1e7dc] rounded-xl border border-[#e0cfbd] text-[11px] text-[#715541]">
              ℹ️ New vendor registrations submit a merchant application defaulting to <strong>PENDING</strong> status until reviewed by marketplace administration.
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Merchant Contact Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rajesh Kumar"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a704f] bg-[#faf7f2]/50"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="merchant@example.com"
                  className="w-full p-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a704f] bg-[#faf7f2]/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9811122233"
                  className="w-full p-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a704f] bg-[#faf7f2]/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Store / Business Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Apex Electronics, Green Earth"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a704f] bg-[#faf7f2]/50"
                />
                <Store className="w-4 h-4 text-[#9a704f] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Store Description & Products</label>
              <textarea
                rows={2}
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                placeholder="What products will you sell on NexStore?"
                className="w-full p-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a704f] bg-[#faf7f2]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Account Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full p-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a704f] bg-[#faf7f2]/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#4a3428] hover:bg-[#634735] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Submitting Application...' : 'Submit Vendor Application'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Footer: Explore as Guest */}
        <div className="pt-2 border-t border-[#e2d5c6] text-center">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs font-bold text-[#654735] hover:text-[#33261f] hover:underline inline-flex items-center gap-1"
          >
            Explore Marketplace as Guest <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
