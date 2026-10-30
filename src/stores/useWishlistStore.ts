import { create } from "zustand";
import { wishlistApi } from "../services/api";

interface WishlistState {
  wishlists: any[];
  wishlistIds: Set<number>;
  total: number;
  loading: boolean;
  error: string | null;
  fetchWishlist: (force?: boolean) => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlists: [],
  wishlistIds: new Set<number>(),
  total: 0,
  loading: false,
  error: null,

  fetchWishlist: async (force = false) => {
    if (!force && get().wishlists.length === 0) {
      set({ loading: true, error: null });
    }
    try {
      const res = await wishlistApi.getMyWishlist();
      const items = res.data || [];
      const ids = new Set<number>(items.map((item: any) => item.productId));
      set({
        wishlists: items,
        wishlistIds: ids,
        total: res.total || items.length,
        loading: false,
      });
    } catch {
      set({ loading: false, error: "Failed to fetch wishlist" });
    }
  },

  addToWishlist: async (productId) => {
    await wishlistApi.addToWishlist({ productId });
    await get().fetchWishlist(true);
  },

  removeFromWishlist: async (productId) => {
    await wishlistApi.removeFromWishlist(productId);
    await get().fetchWishlist(true);
  },
}));

