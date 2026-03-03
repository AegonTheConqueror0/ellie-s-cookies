import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingBag, User, Calendar, CheckCircle2, Clock, XCircle, Search, Cookie, Phone, Mail, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';
import { Order, OrderStatus, SavedRecipe } from '../types';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // New Order Form State
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    customerName: '',
    recipeId: '',
    quantity: 1,
    status: 'pending',
    orderDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();

    // Setup real-time updates
    const socket = io();
    
    socket.on('order:created', () => {
      fetchData();
      showToast('New order received! 🍪');
    });

    socket.on('order:updated', () => {
      fetchData();
    });

    socket.on('order:deleted', () => {
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, recipesRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/recipes')
      ]);
      const ordersData = await ordersRes.json();
      const recipesData = await recipesRes.json();
      setOrders(ordersData);
      setRecipes(recipesData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.customerName || !newOrder.recipeId) {
      showToast('Please fill in all required fields');
      return;
    }

    const selectedRecipe = recipes.find(r => r.id === newOrder.recipeId);
    if (!selectedRecipe) return;

    const order: Partial<Order> = {
      id: crypto.randomUUID(),
      customerName: newOrder.customerName!,
      recipeId: newOrder.recipeId!,
      recipeName: selectedRecipe.name,
      quantity: newOrder.quantity || 1,
      totalPrice: (selectedRecipe.sellingPrice || 0) * (newOrder.quantity || 1),
      status: 'pending',
      orderDate: newOrder.orderDate || new Date().toISOString().split('T')[0],
      deliveryDate: newOrder.deliveryDate,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (res.ok) {
        fetchData();
        setShowAddOrder(false);
        setNewOrder({
          customerName: '',
          recipeId: '',
          quantity: 1,
          status: 'pending',
          orderDate: new Date().toISOString().split('T')[0],
        });
        showToast('Order added successfully!');
      }
    } catch (err) {
      console.error('Failed to add order:', err);
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
        showToast(`Order marked as ${status}`);
      }
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(orders.filter(o => o.id !== id));
        showToast('Order deleted');
      }
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.recipeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-medium">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold tracking-tight">Order Tracking</h1>
          </div>
          <p className="text-slate-500">Manage your customer orders and deliveries</p>
        </div>
        <button
          onClick={() => setShowAddOrder(true)}
          className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-2xl hover:bg-amber-700 transition-all font-bold shadow-lg shadow-amber-100"
        >
          <Plus className="w-5 h-5" />
          New Order
        </button>
      </header>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer or cookie type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 border-dashed">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-200" />
            <h3 className="text-lg font-bold text-slate-400">No orders found</h3>
            <p className="text-slate-400">Start by adding a new order for your cookies!</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{order.customerName}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <Cookie className="w-3 h-3" /> {order.recipeName}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-sm font-medium text-slate-500">Qty: {order.quantity}</span>
                  </div>
                  {(order.contactNumber || order.email) && (
                    <div className="flex flex-wrap gap-3 mt-2">
                      {order.contactNumber && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {order.contactNumber}
                        </span>
                      )}
                      {order.email && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {order.email}
                        </span>
                      )}
                    </div>
                  )}
                  {order.address && (
                    <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {order.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 flex-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Price</span>
                  <span className="text-lg font-bold text-slate-900">₱{order.totalPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Order Date</span>
                  <span className="text-sm font-medium text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {order.orderDate}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status</span>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${getStatusClass(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors"
                    title="Mark as Completed"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                )}
                {order.status !== 'cancelled' && order.status !== 'completed' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                    title="Cancel Order"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => deleteOrder(order.id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  title="Delete Order"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Order Modal */}
      <AnimatePresence>
        {showAddOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowAddOrder(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-600" />
                  New Order
                </h2>
                <button
                  onClick={() => setShowAddOrder(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <Plus className="w-5 h-5 rotate-45 text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={handleAddOrder} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={newOrder.customerName}
                    onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    placeholder="e.g. Juan Dela Cruz"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Cookie Type</label>
                    <select
                      required
                      value={newOrder.recipeId}
                      onChange={(e) => setNewOrder({ ...newOrder, recipeId: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    >
                      <option value="">Select Recipe</option>
                      {recipes.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newOrder.quantity === 0 ? '' : newOrder.quantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewOrder({ ...newOrder, quantity: val === '' ? 0 : parseInt(val) });
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Order Date</label>
                    <input
                      type="date"
                      required
                      value={newOrder.orderDate}
                      onChange={(e) => setNewOrder({ ...newOrder, orderDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Delivery Date (Optional)</label>
                    <input
                      type="date"
                      value={newOrder.deliveryDate || ''}
                      onChange={(e) => setNewOrder({ ...newOrder, deliveryDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Contact Number</label>
                    <input
                      type="tel"
                      value={newOrder.contactNumber || ''}
                      onChange={(e) => setNewOrder({ ...newOrder, contactNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                      placeholder="09xx-xxx-xxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Email</label>
                    <input
                      type="email"
                      value={newOrder.email || ''}
                      onChange={(e) => setNewOrder({ ...newOrder, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                      placeholder="customer@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Address</label>
                  <textarea
                    value={newOrder.address || ''}
                    onChange={(e) => setNewOrder({ ...newOrder, address: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none"
                    placeholder="Delivery address..."
                    rows={2}
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                  >
                    Create Order
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
