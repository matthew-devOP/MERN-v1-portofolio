// User types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  avatar?: string;
  bio?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RefreshTokenResponse {
  user: User;
  accessToken: string;
}

// Post types
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: User;
  category?: string;
  tags: string[];
  featuredImage?: string;
  published: boolean;
  featured: boolean;
  views: number;
  likes: Like[];
  likesCount: number;
  commentsCount: number;
  readingTime: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
}

export interface UpdatePostData extends Partial<CreatePostData> {}

// Comment types
export interface Comment {
  id: string;
  content: string;
  author: User;
  post: string;
  parent?: string;
  likes: Like[];
  likesCount: number;
  isApproved: boolean;
  edited: boolean;
  editedAt?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentData {
  content: string;
  postId: string;
  parentId?: string;
}

export interface UpdateCommentData {
  content: string;
}

// Like type
export interface Like {
  user: string;
  createdAt: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  category?: string;
  tags?: string;
  published?: boolean;
  featured?: boolean;
}

export interface PaginationMeta {
  current: number;
  pages: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiError {
  success: false;
  status: string;
  message: string;
}

// Upload types
export interface UploadResponse {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Form types
export interface FormErrors {
  [key: string]: string | string[] | undefined;
}

// Route types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

// Search types
export interface SearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  author?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// Post stats types
export interface PostStats {
  views: number;
  likes: number;
  comments: number;
  published: boolean;
  featured: boolean;
  createdAt: string;
  publishedAt?: string;
}

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Query keys for React Query
export const QUERY_KEYS = {
  // Auth
  currentUser: ['auth', 'currentUser'] as const,
  
  // Posts
  posts: (params?: PaginationParams) => ['posts', params] as const,
  post: (id: string) => ['posts', id] as const,
  postBySlug: (slug: string) => ['posts', 'slug', slug] as const,
  myPosts: (params?: PaginationParams) => ['posts', 'my', params] as const,
  featuredPosts: (limit?: number) => ['posts', 'featured', limit] as const,
  popularPosts: (limit?: number) => ['posts', 'popular', limit] as const,
  postStats: (id: string) => ['posts', id, 'stats'] as const,
  
  // Comments
  postComments: (postId: string, params?: PaginationParams) => ['comments', 'post', postId, params] as const,
  commentReplies: (commentId: string, params?: PaginationParams) => ['comments', 'replies', commentId, params] as const,
  myComments: (params?: PaginationParams) => ['comments', 'my', params] as const,
} as const;

// Environment variables
export interface EnvConfig {
  API_URL: string;
  APP_NAME: string;
  APP_DESCRIPTION: string;
  APP_VERSION: string;
  CLOUDINARY_CLOUD_NAME: string;
}

// Component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Export utility type for component props
export type ComponentProps<T> = T & BaseComponentProps;