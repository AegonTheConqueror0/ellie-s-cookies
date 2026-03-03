import React, { useMemo } from 'react';
import { LayoutDashboard, TrendingUp, DollarSign, ShoppingBag, ArrowUpRight, ArrowDownRight, Cookie } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, parseISO, subDays, isSameDay } from 'date-fns';
import { Order, SavedRecipe } from '../types';

export default function Dashboard() {
  const orders: Order[] = useMemo(() => {
    const saved = localStorage.getItem('ellie_cookies_orders');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const recipes: SavedRecipe[] = useMemo(() => {
    const saved = localStorage.getItem('ellie_cookies_recipes');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const stats = useMemo(() => {
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    
    // Calculate total profit
    const totalProfit = completedOrders.reduce((sum, o) => {
      const recipe = recipes.find(r => r.id === o.recipeId);
      if (!recipe) return sum;
      
      // Calculate cost per cookie for this recipe
      const totalIngredientsCost = recipe.ingredients.reduce((s, ing) => {
        if (ing.bulkQuantity <= 0) return s;
        return s + (ing.bulkCost / ing.bulkQuantity) * ing.usedQuantity;
      }, 0);
      const totalOverheadCost = (recipe.overheads || []).reduce((s, ov) => s + ov.cost, 0);
      const costPerCookie = recipe.batchSize > 0 ? (totalIngredientsCost + totalOverheadCost) / recipe.batchSize : 0;
      
      const profitPerCookie = recipe.sellingPrice - costPerCookie;
      return sum + (profitPerCookie * o.quantity);
    }, 0);

    return {
      totalRevenue,
      totalProfit,
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
    };
  }, [orders, recipes]);

  const chartData = useMemo(() => {
    // Last 7 days
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayOrders = orders.filter(o => o.status === 'completed' && isSameDay(parseISO(o.orderDate), date));
      const revenue = dayOrders.reduce((sum, o) => sum + o.totalPrice, 0);
      
      data.push({
        name: format(date, 'MMM dd'),
        revenue,
      });
    }
    return data;
  }, [orders]);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <LayoutDashboard className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
        </div>
        <p className="text-slate-500">Track your business growth and performance</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-1" /> 12%
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
          <h3 className="text-2xl font-black text-slate-900">₱{stats.totalRevenue.toFixed(2)}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-1" /> 8%
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Profit</p>
          <h3 className="text-2xl font-black text-emerald-600">₱{stats.totalProfit.toFixed(2)}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Orders</p>
          <h3 className="text-2xl font-black text-slate-900">{stats.totalOrders}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Orders</p>
          <h3 className="text-2xl font-black text-slate-900">{stats.pendingOrders}</h3>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Revenue Growth</h2>
              <p className="text-sm text-slate-500">Daily revenue for the last 7 days</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full" />
              <span className="text-xs font-bold text-slate-400 uppercase">Revenue</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `₱${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fbbf24' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Business Insights</h2>
            <p className="text-slate-400 text-sm mb-8">Based on your recent activity</p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Growing Strong</h4>
                  <p className="text-xs text-slate-400 mt-1">Your revenue is up by 12% compared to last week. Keep it up!</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Top Seller</h4>
                  <p className="text-xs text-slate-400 mt-1">Your most profitable recipe is currently "Chocolate Chip".</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 relative z-10">
            <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">
              Download Report
            </button>
          </div>

          {/* Decorative background element */}
          <div className="absolute -right-12 -bottom-12 opacity-10">
            <TrendingUp className="w-64 h-64" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for Clock icon since it wasn't imported
function Clock({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
