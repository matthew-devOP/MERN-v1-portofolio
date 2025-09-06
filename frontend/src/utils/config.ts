import { EnvConfig } from '@/types';

// Environment configuration
export const env: EnvConfig = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Blog Platform',
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'A modern blog platform',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    logoutAll: '/auth/logout-all',
    me: '/auth/me',
    profile: '/auth/profile',
    changePassword: '/auth/change-password',
  },
  
  // Posts
  posts: {
    list: '/posts',
    create: '/posts',
    byId: (id: string) => `/posts/${id}`,
    bySlug: (slug: string) => `/posts/slug/${slug}`,
    update: (id: string) => `/posts/${id}`,
    delete: (id: string) => `/posts/${id}`,
    like: (id: string) => `/posts/${id}/like`,
    stats: (id: string) => `/posts/${id}/stats`,
    featured: '/posts/featured',
    popular: '/posts/popular',
    my: '/posts/my',
  },
  
  // Comments
  comments: {
    list: '/comments',
    create: '/comments',
    postComments: (postId: string) => `/comments/post/${postId}`,
    replies: (commentId: string) => `/comments/${commentId}/replies`,
    update: (id: string) => `/comments/${id}`,
    delete: (id: string) => `/comments/${id}`,
    like: (id: string) => `/comments/${id}/like`,
    moderate: (id: string) => `/comments/${id}/moderate`,
    my: '/comments/my',
  },
  
  // Upload
  upload: {
    avatar: '/upload/avatar',
    postImage: (postId: string) => `/upload/post/${postId}`,
    image: '/upload/image',
    delete: '/upload/delete',
    info: '/upload/info',
  },
} as const;

// App constants
export const APP_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  
  // Upload limits
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  
  // Post limits
  MIN_TITLE_LENGTH: 5,
  MAX_TITLE_LENGTH: 200,
  MIN_CONTENT_LENGTH: 10,
  MAX_EXCERPT_LENGTH: 300,
  MAX_TAGS: 10,
  
  // Comment limits
  MIN_COMMENT_LENGTH: 1,
  MAX_COMMENT_LENGTH: 1000,
  
  // User limits
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MIN_PASSWORD_LENGTH: 6,
  MAX_BIO_LENGTH: 500,
  
  // Cache durations (in milliseconds)
  CACHE_DURATION: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 15 * 60 * 1000, // 15 minutes
    LONG: 60 * 60 * 1000, // 1 hour
  },
  
  // Local storage keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'blog_access_token',
    THEME: 'blog_theme',
    USER_PREFERENCES: 'blog_user_preferences',
    DRAFT_POSTS: 'blog_draft_posts',
  },
  
  // Animation durations
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  
  // Debounce delays
  DEBOUNCE_DELAY: {
    SEARCH: 300,
    INPUT: 500,
    RESIZE: 100,
  },
  
  // Toast notification defaults
  TOAST_DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 3000,
  },
} as const;

// Feature flags
export const FEATURES = {
  DARK_MODE: true,
  COMMENTS: true,
  LIKES: true,
  SEARCH: true,
  CATEGORIES: true,
  TAGS: true,
  FILE_UPLOAD: true,
  EMAIL_VERIFICATION: false,
  SOCIAL_LOGIN: false,
  PWA: true,
  ANALYTICS: false,
} as const;

// Theme configuration
export const THEME_CONFIG = {
  defaultTheme: 'system' as const,
  storageKey: APP_CONSTANTS.STORAGE_KEYS.THEME,
  attribute: 'class',
  enableSystem: true,
} as const;

// Development helpers
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const isBrowser = typeof window !== 'undefined';

// Browser detection (simple)
export const getBrowserInfo = () => {
  if (!isBrowser) return null;
  
  const userAgent = navigator.userAgent;
  
  return {
    isChrome: userAgent.includes('Chrome'),
    isFirefox: userAgent.includes('Firefox'),
    isSafari: userAgent.includes('Safari') && !userAgent.includes('Chrome'),
    isEdge: userAgent.includes('Edge'),
    isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
  };
};

export default {
  env,
  API_ENDPOINTS,
  APP_CONSTANTS,
  FEATURES,
  THEME_CONFIG,
  isDevelopment,
  isProduction,
  isBrowser,
  getBrowserInfo,
};