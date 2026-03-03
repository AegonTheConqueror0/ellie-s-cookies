/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Calculator, Cookie, Coins, Scale, Info, Save, FolderOpen, FilePlus, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Ingredient {
  id: string;
  name: string;
  bulkQuantity: number;
  bulkUnit: string;
  bulkCost: number;
  usedQuantity: number;
  usedUnit: string;
}

interface SavedRecipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  batchSize: number;
  date: string;
}

const UNITS = ['grams', 'pieces', 'cups', 'ml', 'kg', 'oz', 'lb', 'tsp', 'tbsp'];

export default function App() {
  const [recipeName, setRecipeName] = useState<string>('New Cookie Recipe');
  const [currentRecipeId, setCurrentRecipeId] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    {
      id: '1',
      name: 'Flour',
      bulkQuantity: 1000,
      bulkUnit: 'grams',
      bulkCost: 5.00,
      usedQuantity: 250,
      usedUnit: 'grams',
    },
  ]);
  const [batchSize, setBatchSize] = useState<number>(12);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>(() => {
    const saved = localStorage.getItem('ellie_cookies_recipes');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSaved, setShowSaved] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const saveRecipe = () => {
    if (!recipeName.trim()) {
      showToast('Please enter a recipe name');
      return;
    }

    let updatedRecipes: SavedRecipe[];
    
    if (currentRecipeId) {
      // Update existing
      updatedRecipes = savedRecipes.map(r => 
        r.id === currentRecipeId 
          ? { ...r, name: recipeName, ingredients, batchSize, date: new Date().toLocaleDateString() }
          : r
      );
      showToast(`Recipe "${recipeName}" updated!`);
    } else {
      // Create new
      const newRecipe: SavedRecipe = {
        id: crypto.randomUUID(),
        name: recipeName,
        ingredients,
        batchSize,
        date: new Date().toLocaleDateString(),
      };
      updatedRecipes = [newRecipe, ...savedRecipes];
      showToast(`Recipe "${recipeName}" saved!`);
    }

    setSavedRecipes(updatedRecipes);
    localStorage.setItem('ellie_cookies_recipes', JSON.stringify(updatedRecipes));
    
    // Reset screen after saving
    newRecipe();
  };

  const loadRecipe = (recipe: SavedRecipe) => {
    setRecipeName(recipe.name);
    setIngredients(recipe.ingredients);
    setBatchSize(recipe.batchSize);
    setCurrentRecipeId(recipe.id);
    setShowSaved(false);
  };

  const deleteSavedRecipe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedRecipes.filter(r => r.id !== id);
    setSavedRecipes(updated);
    localStorage.setItem('ellie_cookies_recipes', JSON.stringify(updated));
    if (currentRecipeId === id) {
      newRecipe();
    }
  };

  const newRecipe = () => {
    setRecipeName('New Cookie Recipe');
    setCurrentRecipeId(null);
    setIngredients([{
      id: crypto.randomUUID(),
      name: '',
      bulkQuantity: 0,
      bulkUnit: 'grams',
      bulkCost: 0,
      usedQuantity: 0,
      usedUnit: 'grams',
    }]);
    setBatchSize(12);
  };

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: crypto.randomUUID(),
      name: '',
      bulkQuantity: 0,
      bulkUnit: 'grams',
      bulkCost: 0,
      usedQuantity: 0,
      usedUnit: 'grams',
    };
    setIngredients([...ingredients, newIngredient]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients(
      ingredients.map((ing) => (ing.id === id ? { ...ing, ...updates } : ing))
    );
  };

  const calculations = useMemo(() => {
    const totalBatchCost = ingredients.reduce((sum, ing) => {
      if (ing.bulkQuantity <= 0) return sum;
      const costPerUnit = ing.bulkCost / ing.bulkQuantity;
      return sum + costPerUnit * ing.usedQuantity;
    }, 0);

    const costPerCookie = batchSize > 0 ? totalBatchCost / batchSize : 0;

    return {
      totalBatchCost,
      costPerCookie,
    };
  }, [ingredients, batchSize]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Notification Toast */}
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

        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Cookie className="w-8 h-8 text-amber-600" />
              <h1 className="text-3xl font-bold tracking-tight">Ellie's Cookies</h1>
            </div>
            <div className="flex items-center gap-2 group">
              <input
                type="text"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:ring-0 p-0 transition-all outline-none font-medium"
                placeholder="Enter recipe name..."
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-medium shadow-sm"
            >
              <FolderOpen className="w-4 h-4" />
              Saved
            </button>
            <button
              onClick={newRecipe}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-medium shadow-sm"
            >
              <FilePlus className="w-4 h-4" />
              New
            </button>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Batch Size</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-16 text-2xl font-bold bg-transparent border-none focus:ring-0 p-0"
                  />
                  <span className="text-slate-400 font-medium">cookies</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Saved Recipes Modal/Overlay */}
        <AnimatePresence>
          {showSaved && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowSaved(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-amber-600" />
                    Saved Recipes
                  </h2>
                  <button
                    onClick={() => setShowSaved(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <Plus className="w-5 h-5 rotate-45 text-slate-400" />
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
                  {savedRecipes.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Cookie className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No saved recipes yet</p>
                    </div>
                  ) : (
                    savedRecipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        onClick={() => loadRecipe(recipe)}
                        className="flex items-center justify-between p-4 rounded-2xl hover:bg-amber-50 border border-transparent hover:border-amber-100 cursor-pointer transition-all group"
                      >
                        <div>
                          <h3 className="font-bold text-slate-800">{recipe.name}</h3>
                          <p className="text-xs text-slate-400">{recipe.date} • {recipe.ingredients.length} ingredients</p>
                        </div>
                        <button
                          onClick={(e) => deleteSavedRecipe(recipe.id, e)}
                          className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Scale className="w-5 h-5 text-slate-400" />
                Ingredients
              </h2>
              <button
                onClick={addIngredient}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Ingredient
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {ingredients.map((ing) => (
                  <motion.div
                    key={ing.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 group relative"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-4">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ingredient Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Chocolate Chips"
                          value={ing.name}
                          onChange={(e) => updateIngredient(ing.id, { name: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bulk Size & Cost</label>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            placeholder="Qty"
                            value={ing.bulkQuantity || ''}
                            onChange={(e) => updateIngredient(ing.id, { bulkQuantity: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                          />
                          <input
                            type="number"
                            placeholder="₱"
                            value={ing.bulkCost || ''}
                            onChange={(e) => updateIngredient(ing.id, { bulkCost: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Used in Batch</label>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            placeholder="Qty"
                            value={ing.usedQuantity || ''}
                            onChange={(e) => updateIngredient(ing.id, { usedQuantity: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                          />
                          <select
                            value={ing.usedUnit}
                            onChange={(e) => updateIngredient(ing.id, { usedUnit: e.target.value, bulkUnit: e.target.value })}
                            className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-xs"
                          >
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="md:col-span-2 flex justify-end">
                        <button
                          onClick={() => removeIngredient(ing.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200 sticky top-8">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-600" />
                Cost Summary
              </h2>

              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Cost Per Cookie</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">₱{calculations.costPerCookie.toFixed(2)}</span>
                    <span className="text-slate-400 font-medium">/ ea</span>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Batch</span>
                    <span className="text-xl font-bold text-slate-700">₱{calculations.totalBatchCost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Batch Size</span>
                    <span className="text-xl font-bold text-slate-700">{batchSize} units</span>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                  <h3 className="text-xs font-bold text-amber-800 uppercase mb-3 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Usage Per Cookie
                  </h3>
                  <div className="space-y-2">
                    {ingredients.filter(i => i.name && i.usedQuantity > 0).map(ing => (
                      <div key={ing.id} className="flex justify-between items-center text-sm">
                        <span className="text-amber-900/70">{ing.name}</span>
                        <span className="font-mono font-medium text-amber-900">
                          {(ing.usedQuantity / batchSize).toFixed(2)} {ing.usedUnit}
                        </span>
                      </div>
                    ))}
                    {ingredients.filter(i => i.name && i.usedQuantity > 0).length === 0 && (
                      <p className="text-xs text-amber-600/60 italic text-center">Add ingredients to see breakdown</p>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={saveRecipe}
                className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {currentRecipeId ? 'Update Recipe' : 'Save Recipe'}
              </button>
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl text-white overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Pro Tip</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Don't forget to include packaging costs (bags, stickers) as ingredients to get a truly accurate cost per cookie!
                </p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Cookie className="w-32 h-32 rotate-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
