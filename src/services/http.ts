import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { setupCache } from "axios-cache-interceptor";
import { toast } from "sonner";
import i18n from "../i18n";

export enum StorageEventKey {
  AuthChanged = "AuthChanged",
}

export const translateErrorCode = (codeOrMsg?: string): string => {
  if (!codeOrMsg) return i18n.t("errors.999999");
  const key = `errors.${codeOrMsg}`;
  if (i18n.exists(key)) return i18n.t(key);
  if (codeOrMsg.includes(" ") || codeOrMsg.length > 20) return codeOrMsg;
  return i18n.t("errors.999999");
};

export const notify = {
  error: (codeOrMsg?: string) => {
    toast.error(translateErrorCode(codeOrMsg));
  },
  success: (codeOrMsg?: string) => {
    if (!codeOrMsg) return;
    const key = `success.${codeOrMsg}`;
    toast.success(i18n.exists(key) ? i18n.t(key) : codeOrMsg);
  },
  info: (codeOrMsg?: string) => {
    if (!codeOrMsg) return;
    const key = `info.${codeOrMsg}`;
    toast.info(i18n.exists(key) ? i18n.t(key) : codeOrMsg);
  },
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const clearAuthAndDispatchLogout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.setItem(StorageEventKey.AuthChanged, String(Date.now()));
  window.dispatchEvent(new CustomEvent("auth:logout"));
};

export const getApiBaseUrl = (): string => {
  const base = "https://api.deluxe-market.com/api".replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
};

const createHttpClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    paramsSerializer: {
      serialize: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value != null) {
            searchParams.append(key, String(value));
          }
        });
        return searchParams.toString();
      },
    },
  });

  setupCache(instance, { ttl: 1000 });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalConfig = error.config;
      if (
        error.response?.status === 401 &&
        originalConfig &&
        !originalConfig._retry &&
        !originalConfig.url?.includes("/auth/login") &&
        !originalConfig.url?.includes("/auth/refresh-tokens")
      ) {
        if (isRefreshing) {
          return new Promise<string | null>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((newToken) => {
            originalConfig._retry = true;
            if (originalConfig.headers && newToken) {
              originalConfig.headers.Authorization = `Bearer ${newToken}`;
            }
            return instance(originalConfig);
          });
        }

        originalConfig._retry = true;
        isRefreshing = true;

        const storedRefreshToken = localStorage.getItem("refreshToken");
        if (!storedRefreshToken) {
          isRefreshing = false;
          clearAuthAndDispatchLogout();
          return Promise.reject(error);
        }

        const performRefresh = async () => {
          try {
            const baseUrl = getApiBaseUrl();
            const res = await axios.post(`${baseUrl}/auth/refresh-tokens`, {
              refreshToken: storedRefreshToken,
            });
            const newAccess = res.data?.accessToken;
            const newRefresh = res.data?.refreshToken;
            if (newAccess) {
              localStorage.setItem("accessToken", newAccess);
              if (newRefresh) {
                localStorage.setItem("refreshToken", newRefresh);
              }
              if (originalConfig.headers) {
                originalConfig.headers.Authorization = `Bearer ${newAccess}`;
              }
              processQueue(null, newAccess);
              return instance(originalConfig);
            }
            throw new Error("Refresh token returned invalid payload");
          } catch (refreshErr) {
            processQueue(refreshErr, null);
            if (!error.config?.silent) {
              notify.error("UNAUTHORIZED");
            }
            clearAuthAndDispatchLogout();
            return Promise.reject(refreshErr);
          } finally {
            isRefreshing = false;
          }
        };

        if (typeof navigator !== "undefined" && navigator.locks) {
          return navigator.locks.request("refresh_token_lock", async () => {
            if (localStorage.getItem("refreshToken") !== storedRefreshToken) {
              const updatedAccess = localStorage.getItem("accessToken");
              isRefreshing = false;
              if (updatedAccess) {
                if (originalConfig.headers) {
                  originalConfig.headers.Authorization = `Bearer ${updatedAccess}`;
                }
                processQueue(null, updatedAccess);
                return instance(originalConfig);
              }
              processQueue(error, null);
              clearAuthAndDispatchLogout();
              return Promise.reject(error);
            }
            return performRefresh();
          });
        }

        return performRefresh();
      }

      if (!error.config?.silent) {
        const data = error.response?.data;
        const code = data?.code;
        const message = data?.message;
        notify.error(code || message);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const http = createHttpClient();
export const swrFetcher = (url: string) => http.get(url).then((res) => res.data);

