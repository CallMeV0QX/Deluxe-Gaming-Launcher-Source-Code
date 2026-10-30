import { create } from "zustand";
import { cartApi } from "../services/api";

export interface CartSummary {
  totalItems: number;
  subtotal: number;
}

interface CartState {
  cartItems: any[];
  summary: CartSummary;
  loading: boolean;
  error: string | null;
  fetchCart: (force?: boolean) => Promise<void>;
  addToCart: (productId: number, quantity?: number, rentalDays?: number) => Promise<any>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  summary: { totalItems: 0, subtotal: 0 },
  loading: false,
  error: null,

  fetchCart: async (force = false) => {
    if (!force && get().cartItems.length === 0) {
      set({ loading: true, error: null });
    }
    try {
      const res = await cartApi.getMyCart();
      set({
        cartItems: res.data || [],
        summary: res.summary || { totalItems: 0, subtotal: 0 },
        loading: false,
      });
    } catch {
      set({ loading: false, error: "Failed to fetch cart" });
    }
  },

  addToCart: async (productId, quantity = 1, rentalDays) => {
    const res = await cartApi.addToCart({ productId, quantity, rentalDays });
    await get().fetchCart(true);
    return res;
  },

  updateQuantity: async (itemId, quantity) => {
    await cartApi.updateCartItem(itemId, { quantity });
    await get().fetchCart(true);
  },

  removeItem: async (itemId) => {
    await cartApi.removeCartItem(itemId);
    await get().fetchCart(true);
  },

  clearCart: async () => {
    await cartApi.clearCart();
    set({ cartItems: [], summary: { totalItems: 0, subtotal: 0 } });
  },
}));

