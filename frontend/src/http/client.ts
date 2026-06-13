import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';

import { env } from '@/config/env';
import { useAuthStore } from '@/stores/auth-store';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/http/types/api-error';
import type { RefreshSessionResponse } from '@/http/types/auth/refresh-session';

export type RequestConfig<TData = unknown> = AxiosRequestConfig<TData>;

export type ResponseErrorConfig<TError = ApiErrorResponse> = AxiosError<TError>;

const apiDelay = env.VITE_ENABLE_API_DELAY ? 1000 : 0;

export const axiosInstance = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshAxiosInstance = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

const AUTH_ROUTES_WITHOUT_TOKEN_REFRESH = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh',
] as const;

function shouldSkipTokenRefresh(url?: string) {
  if (!url) return false;

  return AUTH_ROUTES_WITHOUT_TOKEN_REFRESH.some((route) => url.includes(route));
}

axiosInstance.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (shouldSkipTokenRefresh(originalRequest.url)) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, setTokens, logout } = useAuthStore.getState();

      if (!refreshToken) {
        isRefreshing = false;
        logout();
        window.location.href = '/sign-in';
        return Promise.reject(error);
      }

      try {
        const { data } = await refreshAxiosInstance.post<
          ApiSuccessResponse<RefreshSessionResponse>
        >('/auth/refresh', { refreshToken });

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        setTokens(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        window.location.href = '/sign-in';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

async function client<TData, TBody = unknown>(
  config: RequestConfig<TBody>,
): Promise<AxiosResponse<TData>> {
  if (apiDelay > 0) {
    await new Promise((resolve) => setTimeout(resolve, apiDelay));
  }

  const response = await axiosInstance.request<ApiSuccessResponse<TData> | TData>(config);

  if (
    response.data &&
    typeof response.data === 'object' &&
    'data' in response.data &&
    (response.data as ApiSuccessResponse<TData>).data !== undefined
  ) {
    return {
      ...response,
      data: (response.data as ApiSuccessResponse<TData>).data,
    };
  }

  return response as AxiosResponse<TData>;
}

export default client;
