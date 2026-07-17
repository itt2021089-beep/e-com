import { create } from 'zustand';
import api from '../services/api';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: { name: string; price: string; stock: number };
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => void; // Used after successful checkout
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  totalAmount: 0,
  fetchCart: async () => {
    try {
      const res = await api.get('/cart');
      set({ items: res.data.items || [], totalAmount: res.data.totalAmount || 0 });
    } catch (error) {
      console.error('Error fetching cart', error);
    }
  },
  addItem: async (productId, quantity) => {
    const res = await api.post('/cart/items', { productId, quantity });
    set({ items: res.data.items, totalAmount: res.data.totalAmount });
  },
  updateItem: async (productId, quantity) => {
    const res = await api.put(`/cart/items/${productId}`, { quantity });
    set({ items: res.data.items, totalAmount: res.data.totalAmount });
  },
  removeItem: async (productId) => {
    const res = await api.delete(`/cart/items/${productId}`);
    set({ items: res.data.items, totalAmount: res.data.totalAmount });
  },
  clearCart: () => set({ items: [], totalAmount: 0 })
}));