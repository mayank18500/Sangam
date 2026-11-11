import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@sangam.travel');
  const [password, setPassword] = useState('Admin@123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-xl shadow-lg p-8">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-xl bg-[#0B192C] text-teal-400 items-center justify-center mb-3 shadow-sm">
            <Layers className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SANGAM</h1>
          <p className="text-xs text-teal-700 font-medium tracking-wide uppercase mt-1">
            Where Travel Inventory Comes Together
          </p>
          <p className="text-xs text-slate-500 mt-2">
            AI-powered multi-supplier travel inventory intelligence platform
          </p>
        </div>

        {/* Demo credentials hint box */}
        <div className="mb-6 p-3 rounded-lg bg-teal-50/60 border border-teal-200 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-semibold text-teal-900 mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Pre-seeded Demo Credentials</span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-600">
            <span>Email: <strong className="text-slate-800">admin@sangam.travel</strong></span>
            <span>Password: <strong className="text-slate-800">Admin@123456</strong></span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
          Enterprise B2B SaaS • Strict Multi-Tenant Separation
        </div>
      </div>
    </div>
  );
};
