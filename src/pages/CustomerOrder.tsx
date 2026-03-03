import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, Send, CheckCircle2, Phone, Mail, MapPin, MessageSquare, ShoppingBag } from 'lucide-react';
import { SavedRecipe, Order } from '../types';

export default function CustomerOrder() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    contactNumber: '',
    email: '',
    address: '',
    notes: '',
    recipeId: '',
    quantity: 1,
  });

  useEffect(() => {
    fetch('/api/recipes')
      .then(res => res.json())
      .then(data => {
        setRecipes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch recipes:', err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRecipe = recipes.find(r => r.id === formData.recipeId);
    if (!selectedRecipe) return;

    const order: Partial<Order> = {
      id: crypto.randomUUID(),
      customerName: formData.customerName,
      contactNumber: formData.contactNumber,
      email: formData.email,
      address: formData.address,
      notes: formData.notes,
      recipeId: formData.recipeId,
      recipeName: selectedRecipe.name,
      quantity: formData.quantity,
      totalPrice: (selectedRecipe.sellingPrice || 0) * formData.quantity,
      status: 'pending',
      orderDate: new Date().toISOString().split('T')[0],
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to submit order:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Cookie className="w-12 h-12 text-amber-600 opacity-20" />
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[40px] shadow-xl text-center max-w-md w-full border border-amber-100"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-4">Order Received!</h1>
          <p className="text-slate-600 mb-8">
            Thank you for your order, {formData.customerName.split(' ')[0]}! Ellie will contact you soon to confirm your delivery.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-8 py-4 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700 transition-all"
          >
            Place Another Order
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-block p-4 bg-white rounded-full shadow-sm mb-6 border border-amber-50"
          >
            <Cookie className="w-10 h-10 text-amber-600" />
          </motion.div>
          <h1 className="text-5xl font-serif font-bold text-slate-900 mb-4">Ellie's Cookies</h1>
          <p className="text-slate-500 font-serif italic text-lg">Freshly baked with love, just for you.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Listing */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-amber-600" />
              Our Menu
            </h2>
            <div className="space-y-4">
              {recipes.map((recipe) => (
                <motion.div
                  key={recipe.id}
                  whileHover={{ x: 10 }}
                  className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer ${
                    formData.recipeId === recipe.id 
                      ? 'bg-amber-50 border-amber-200 shadow-md' 
                      : 'bg-white border-transparent hover:border-amber-100'
                  }`}
                  onClick={() => setFormData({ ...formData, recipeId: recipe.id })}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{recipe.name}</h3>
                      <p className="text-sm text-slate-500 mt-1 italic">
                        Batch of {recipe.batchSize} cookies
                      </p>
                    </div>
                    <span className="text-2xl font-serif font-bold text-amber-600">
                      ₱{recipe.sellingPrice?.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
              {recipes.length === 0 && (
                <div className="bg-white p-12 rounded-[32px] text-center border border-dashed border-slate-200">
                  <p className="text-slate-400 italic">No products available at the moment.</p>
                </div>
              )}
            </div>
          </section>

          {/* Order Form */}
          <section>
            <div className="bg-white p-8 rounded-[40px] shadow-lg border border-amber-50">
              <h2 className="text-2xl font-serif font-bold text-slate-800 mb-8">Place Your Order</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    <ShoppingBag className="w-3 h-3" /> Select Cookie
                  </label>
                  <select
                    required
                    value={formData.recipeId}
                    onChange={(e) => setFormData({ ...formData, recipeId: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Choose from our menu...</option>
                    {recipes.map(r => (
                      <option key={r.id} value={r.id}>{r.name} - ₱{r.sellingPrice?.toFixed(2)}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Amount</span>
                    <span className="text-2xl font-serif font-bold text-amber-600">
                      ₱{((recipes.find(r => r.id === formData.recipeId)?.sellingPrice || 0) * formData.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-6" />

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    <Phone className="w-3 h-3" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      <Phone className="w-3 h-3" /> Contact Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="09xx-xxx-xxxx"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      <Mail className="w-3 h-3" /> Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    <MapPin className="w-3 h-3" /> Delivery Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Where should we send the cookies?"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    <MessageSquare className="w-3 h-3" /> Special Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any allergies or special requests?"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!formData.recipeId}
                  className="w-full py-5 bg-amber-600 text-white rounded-[24px] font-bold hover:bg-amber-700 transition-all shadow-xl shadow-amber-100 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  <Send className="w-5 h-5" />
                  Place Order
                </button>
              </form>
            </div>
          </section>
        </div>

        <footer className="mt-20 text-center border-t border-amber-100 pt-12">
          <p className="text-slate-400 font-serif italic">© 2026 Ellie's Cookies. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
