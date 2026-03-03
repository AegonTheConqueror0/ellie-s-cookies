import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calculator, LayoutDashboard, ShoppingBag, Cookie, Share2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const copyCustomerLink = () => {
    // Prefer the environment's APP_URL if available, otherwise use current origin
    const baseUrl = (process.env.APP_URL && process.env.APP_URL !== 'undefined') 
      ? process.env.APP_URL 
      : window.location.origin;
    
    const url = baseUrl.replace(/\/$/, '') + '/order';
    navigator.clipboard.writeText(url);
    alert(`Customer order link copied!\n\nURL: ${url}\n\nThis link will work for anyone with internet access.`);
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f5] text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Cookie className="w-8 h-8 text-amber-600" />
            <h1 className="text-xl font-bold tracking-tight">Ellie's Cookies</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? 'bg-amber-50 text-amber-700 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50'
              }`
            }
          >
            <Calculator className="w-5 h-5" />
            Calculator
          </NavLink>
          
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? 'bg-amber-50 text-amber-700 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50'
              }`
            }
          >
            <ShoppingBag className="w-5 h-5" />
            Orders
          </NavLink>
          
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? 'bg-amber-50 text-amber-700 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>
        </nav>
        
        <div className="p-4 border-t border-slate-100 space-y-3">
          <button
            onClick={copyCustomerLink}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all font-medium text-sm"
          >
            <Share2 className="w-4 h-4" />
            Copy Customer Link
          </button>
          <div className="bg-slate-900 p-4 rounded-2xl text-white overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Status</p>
              <p className="text-sm font-medium">Business Growing 🚀</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
