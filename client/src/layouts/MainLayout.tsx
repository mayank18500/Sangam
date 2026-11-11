import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  Database,
  Building2,
  Compass,
  GitCompare,
  Scale,
  BarChart3,
  Settings,
  LogOut,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/suppliers', label: 'Suppliers', icon: Network },
    { to: '/inventory', label: 'Inventory Explorer', icon: Database },
    { to: '/hotels', label: 'Hotels', icon: Building2 },
    { to: '/sightseeing', label: 'Sightseeing', icon: Compass },
    { to: '/matching', label: 'Match Review', icon: GitCompare },
    { to: '/offers', label: 'Offer Comparison', icon: Scale },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0B192C] text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-wider text-lg block leading-none">
                SANGAM
              </span>
              <span className="text-[10px] text-teal-400/90 font-medium tracking-tight block mt-1">
                Where Travel Inventory Comes Together
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 border-l-2 border-teal-400 font-semibold pl-3'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#08101E]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-teal-800 text-teal-200 flex items-center justify-center text-xs font-semibold shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{user?.name || 'Analyst'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.role || 'ANALYST'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Sangam Platform</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-800">Multi-Supplier Intelligence</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PostgreSQL & Intelligence Engine Online</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
