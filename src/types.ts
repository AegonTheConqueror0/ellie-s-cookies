export interface Ingredient {
  id: string;
  name: string;
  bulkQuantity: number;
  bulkUnit: string;
  bulkCost: number;
  usedQuantity: number;
  usedUnit: string;
}

export interface Overhead {
  id: string;
  name: string;
  cost: number;
}

export interface SavedRecipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  overheads: Overhead[];
  batchSize: number;
  sellingPrice: number;
  date: string;
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  recipeId: string;
  recipeName: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  orderDate: string;
  deliveryDate?: string;
}
