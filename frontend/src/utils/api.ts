import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { env, APP_CONSTANTS } from './config';
import type { ApiResponse, ApiError } from '@/types';

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: env.API_URL,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Include cookies for refresh tokens
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token refresh and errors
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 errors (token expired)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh token
          const refreshResponse = await instance.post('/auth/refresh');
          const { accessToken } = refreshResponse.data.data;
          
          // Update stored token
          setAccessToken(accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          clearAuthTokens();
          
          // Only redirect if we're in the browser and not already on login page
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        }
      }

      // Handle other errors
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
      const apiError: ApiError = {
        success: false,
        status: error.response?.data?.status || 'error',
        message: errorMessage,
      };

      return Promise.reject(apiError);
    }
  );

  return instance;
};

// Create API client instance
export const apiClient = createApiClient();

// Token management functions
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
};

export const setAccessToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN, token);
};

export const clearAuthTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
};

// Generic API request function
export const apiRequest = async <T = any>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// HTTP method helpers
export const apiGet = async <T = any>(
  url: string,
  params?: Record<string, any>
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: 'GET',
    url,
    params,
  });
};

export const apiPost = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: 'POST',
    url,
    data,
    ...config,
  });
};

export const apiPut = async <T = any>(
  url: string,
  data?: any
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: 'PUT',
    url,
    data,
  });
};

export const apiPatch = async <T = any>(
  url: string,
  data?: any
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: 'PATCH',
    url,
    data,
  });
};

export const apiDelete = async <T = any>(
  url: string
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: 'DELETE',
    url,
  });
};

// File upload helper
export const apiUpload = async <T = any>(
  url: string,
  file: File,
  additionalData?: Record<string, any>,
  onProgress?: (progressEvent: any) => void
): Promise<ApiResponse<T>> => {
  const formData = new FormData();
  formData.append('image', file);
  
  // Add additional data to form
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }

  return apiRequest<T>({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress,
  });
};

// Helper to check if error is an API error
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    'message' in error &&
    (error as ApiError).success === false
  );
};

// Helper to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

// Query parameter helpers
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        // Handle arrays (e.g., tags)
        searchParams.append(key, value.join(','));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
};

// Response data extractors
export const extractData = <T>(response: ApiResponse<T>): T => {
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to extract data from response');
  }
  return response.data;
};

export const extractPaginatedData = <T>(
  response: ApiResponse<{ data: T[]; pagination: any }>
): { data: T[]; pagination: any } => {
  const result = extractData(response);
  return {
    data: result.data || [],
    pagination: result.pagination || {},
  };
};

// Cache helpers for development
let requestCache: Map<string, { data: any; timestamp: number }> = new Map();

export const getCachedRequest = <T>(key: string, maxAge: number = 5 * 60 * 1000): T | null => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < maxAge) {
    return cached.data;
  }
  
  return null;
};

export const setCachedRequest = <T>(key: string, data: T): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  requestCache.set(key, {
    data,
    timestamp: Date.now(),
  });
  
  // Cleanup old entries (keep only last 100)
  if (requestCache.size > 100) {
    const entries = Array.from(requestCache.entries());
    entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
    requestCache = new Map(entries.slice(0, 100));
  }
};

export default {
  apiClient,
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  apiUpload,
  isApiError,
  getErrorMessage,
  buildQueryString,
  extractData,
  extractPaginatedData,
  getAccessToken,
  setAccessToken,
  clearAuthTokens,
};