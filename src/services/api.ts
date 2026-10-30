import { http, StorageEventKey } from "./http";

export const authApi = {
  login: async (payload: { email: string; password: string }) => {
    const { data } = await http.post("/auth/login", payload);
    localStorage.setItem(StorageEventKey.AuthChanged, String(Date.now()));
    return data;
  },
  refreshToken: async (payload: { refreshToken: string }) => {
    const { data } = await http.post("/auth/refresh-tokens", payload, {
      silent: true,
    } as any);
    return data;
  },
  register: async (payload: {
    displayName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const { data } = await http.post("/auth/register", payload);
    return data;
  },
  resendCode: async (payload: { email: string }) => {
    const { data } = await http.post("/auth/resend-code", payload);
    return data;
  },
  forgotPassword: async (payload: { email: string }) => {
    const { data } = await http.post("/auth/forgot-password", payload);
    return data;
  },
  me: async (config?: { silent?: boolean }) => {
    const { data } = await http.get("/auth/me", config as any);
    return data;
  },
};

export const appVersionApi = {
  getAppVersion: async (options?: { silent?: boolean }) => {
    const { data } = await http.get("/app/version", {
      headers: options?.silent ? ({ silent: true } as any) : undefined,
    });
    return "data" in data && data.data && typeof data.data === "object"
      ? data.data
      : data;
  },
};

export const paymentApi = {
  getTopupQr: async (options?: { amount?: number; silent?: boolean }) => {
    const { data } = await http.get("/payments/qr-code", {
      headers: options?.silent ? ({ silent: true } as any) : undefined,
      params: options?.amount ? { amount: options.amount } : undefined,
    });
    return data;
  },
};

export const cartApi = {
  getMyCart: async () => {
    const { data } = await http.get("/cart");
    return data;
  },
  addToCart: async (payload: {
    productId: number;
    quantity?: number;
    rentalDays?: number;
  }) => {
    const { data } = await http.post("/cart", payload);
    return data;
  },
  updateCartItem: async (id: number, payload: { quantity?: number }) => {
    const { data } = await http.patch(`/cart/${id}`, payload);
    return data;
  },
  removeCartItem: async (id: number) => {
    const { data } = await http.delete(`/cart/${id}`);
    return data;
  },
  clearCart: async () => {
    const { data } = await http.delete("/cart");
    return data;
  },
};

export const wishlistApi = {
  getMyWishlist: async () => {
    const { data } = await http.get("/wishlist");
    return data;
  },
  checkIsWishlisted: async (productId: number) => {
    const { data } = await http.get(`/wishlist/check/${productId}`);
    return data;
  },
  addToWishlist: async (payload: { productId: number }) => {
    const { data } = await http.post("/wishlist", payload);
    return data;
  },
  removeFromWishlist: async (productId: number) => {
    const { data } = await http.delete(`/wishlist/${productId}`);
    return data;
  },
};

export const orderApi = {
  checkoutOrder: async (payload: unknown) => {
    const { data } = await http.post("/orders/checkout", payload);
    return data;
  },
  getMyOrders: async (params?: Record<string, unknown>) => {
    try {
      const { data } = await http.get("/orders/my-orders", { params });
      return data;
    } catch (err) {
      console.warn("Failed to fetch my orders API, falling back:", err);
      return null;
    }
  },
  getOrderById: async (orderId: number | string) => {
    try {
      const { data } = await http.get(`/orders/${orderId}`);
      return data?.data || data;
    } catch (err) {
      console.warn("Failed to fetch order detail API:", err);
      return null;
    }
  },
};

export const denuvoApi = {
  fixDenuvo: async (code: string) => {
    const { data } = await http.post(
      "/denuvo/fix",
      { code: code.trim() },
      { silent: true } as any
    );
    return data;
  },
};

export enum FeedbackType {
  SUGGESTION = "SUGGESTION",
  BUG_REPORT = "BUG_REPORT",
  GENERAL = "GENERAL",
  COMPLAINT = "COMPLAINT",
}

export const feedbackApi = {
  getFeedbacks: async (params?: { take?: number; skip?: number }) => {
    try {
      const { data } = await http.get("/feedbacks", { params });
      return data;
    } catch (err) {
      console.warn("Failed to fetch feedbacks:", err);
      return { data: [], total: 0, take: params?.take || 10, skip: params?.skip || 0 };
    }
  },
  getFeedbackById: async (id: number) => {
    const { data } = await http.get(`/feedbacks/${id}`);
    return data;
  },
  createFeedback: async (payload: unknown) => {
    const { data } = await http.post("/feedbacks", payload);
    return data;
  },
  updateFeedback: async (id: number, payload: unknown) => {
    const { data } = await http.patch(`/feedbacks/${id}`, payload);
    return data;
  },
  deleteFeedback: async (id: number) => {
    const { data } = await http.delete(`/feedbacks/${id}`);
    return data;
  },
};

export const digitalAccountApi = {
  getByProduct: async (productId: number) => {
    const res = await http.get(`/digital-accounts/by-product/${productId}`);
    const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
    return Array.isArray(list) ? list : [];
  },
  startSession: async (digitalAccountId: number) => {
    const { data } = await http.post(
      `/digital-accounts/${digitalAccountId}/start-session`
    );
    return data;
  },
  stopSession: async (digitalAccountId: number) => {
    const { data } = await http.post(
      `/digital-accounts/${digitalAccountId}/stop-session`
    );
    return data;
  },
  heartbeat: async (digitalAccountId: number) => {
    const { data } = await http.post(
      `/digital-accounts/${digitalAccountId}/heartbeat`
    );
    return data;
  },
};

export const productApi = {
  getProducts: async (params?: Record<string, unknown>) => {
    const { data } = await http.get("/products", { params });
    return data;
  },
  getProductById: async (id: number) => {
    const { data } = await http.get(`/products/${id}`);
    return data;
  },
  getProductBySlug: async (slug: string) => {
    const { data } = await http.get(`/products/slug/${slug}`);
    return data;
  },
  createProduct: async (payload: unknown) => {
    const { data } = await http.post("/products", payload);
    return data;
  },
  updateProduct: async (id: number, payload: unknown) => {
    const { data } = await http.patch(`/products/${id}`, payload);
    return data;
  },
  deleteProduct: async (id: number) => {
    const { data } = await http.delete(`/products/${id}`);
    return data;
  },
};

export const reviewApi = {
  getReviews: async (params?: {
    productId?: number;
    take?: number;
    skip?: number;
  }) => {
    try {
      const { data } = await http.get("/product-reviews", { params });
      return data;
    } catch (err) {
      console.warn("Failed to fetch product reviews:", err);
      return {
        data: [],
        total: 0,
        take: params?.take || 10,
        skip: params?.skip || 0,
      };
    }
  },
  createReview: async (payload: {
    productId: number;
    rating: number;
    comment: string;
  }) => {
    const { data } = await http.post("/product-reviews", payload);
    return data;
  },
};

export const categoryApi = {
  getCategories: async (params?: Record<string, unknown>) => {
    const { data } = await http.get("/product-categories", { params });
    return data;
  },
  getCategoryById: async (id: number) => {
    const { data } = await http.get(`/product-categories/${id}`);
    return data;
  },
};

export const tagApi = {
  getTags: async (params?: Record<string, unknown>) => {
    const { data } = await http.get("/product-tags", { params });
    return data;
  },
  getTagById: async (id: number) => {
    const { data } = await http.get(`/product-tags/${id}`);
    return data;
  },
};

