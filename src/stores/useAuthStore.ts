import { create } from "zustand";
import { authApi } from "../services/api";
import { StorageEventKey } from "../services/http";

export interface UserWallet {
  id: number;
  userId: number;
  balance: number;
  spinCredits: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  email: string;
  displayName?: string;
  phone?: string;
  avatar?: string;
  wallet?: UserWallet;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<void>;
  logout: () => void;
  setAuth: (user: UserProfile, accessToken: string, refreshToken?: string) => void;
  updateWalletBalance: (newBalance: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    if (!localStorage.getItem("accessToken")) {
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
      return;
    }
    try {
      const me = await authApi.me({ silent: true });
      if (me && (me.id || me.email)) {
        set({ user: me, isAuthenticated: true, isCheckingAuth: false });
      } else {
        throw new Error("Invalid token");
      }
    } catch (err) {
      console.error("Failed to authenticate:", err);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.setItem(StorageEventKey.AuthChanged, String(Date.now()));
    set({ user: null, isAuthenticated: false, isCheckingAuth: false });
  },

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    localStorage.setItem(StorageEventKey.AuthChanged, String(Date.now()));
    set({ user, isAuthenticated: true, isCheckingAuth: false });
  },

  updateWalletBalance: (newBalance) => {
    set((state) => {
      if (!state.user) return state;
      const existingWallet = state.user.wallet;
      return {
        user: {
          ...state.user,
          wallet: existingWallet
            ? { ...existingWallet, balance: newBalance }
            : {
                id: 0,
                userId: state.user.id,
                balance: newBalance,
                spinCredits: 0,
                status: "ACTIVE",
                createdAt: "",
                updatedAt: "",
              },
        },
      };
    });
  },
}));

