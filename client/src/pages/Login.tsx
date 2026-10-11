import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

export function Login() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const redirectUrl = searchParams.get('redirect') || null;

  const navigateAfterAuth = (user: any) => {
    if (redirectUrl) {
      navigate(redirectUrl);
      return;
    }
    if (user.role === 'VENDOR') {
      navigate('/vendor/dashboard');
    } else if (user.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please fill in both email and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login({ email, password });
      success(`Welcome back, ${user.name}!`);
      navigateAfterAuth(user);
    } catch (err: any) {
      error(err.message || 'Login failed');
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
      navigateAfterAuth(user);
    } catch (err: any) {
      error(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900">NexStore</span>
          </Link>
          <h2 className="text-xl font-extrabold text-slate-900">Sign in to your account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your orders, vendor portal, or admin command center
          </p>
        </div>

        {/* 1-Click Quick Demo Login Shortcuts */}
        <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-2xl p-4 border border-indigo-100 space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> 1-Click Demo Accounts (Instant Testing)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('customer@example.com', 'Customer')}
              className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 shadow-xs flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="block text-[11px] leading-tight">Customer</span>
                <span className="text-[9px] text-slate-400 font-normal">Priya Sharma</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('vendor1@example.com', 'Vendor 1')}
              className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 shadow-xs flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Store className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="block text-[11px] leading-tight">Vendor 1</span>
                <span className="text-[9px] text-slate-400 font-normal">ElectroHub</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('vendor2@example.com', 'Vendor 2')}
              className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 shadow-xs flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Store className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="block text-[11px] leading-tight">Vendor 2</span>
                <span className="text-[9px] text-slate-400 font-normal">GadgetWorld</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@example.com', 'Admin')}
              className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 shadow-xs flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <span className="block text-[11px] leading-tight">Admin</span>
                <span className="text-[9px] text-slate-400 font-normal">Administrator</span>
              </div>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="text-center pt-2 text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 font-bold hover:underline">
              Sign up here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
