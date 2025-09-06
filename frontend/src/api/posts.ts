import {
  Post,
  CreatePostData,
  UpdatePostData,
  PaginationParams,
  PaginatedResponse,
  PostStats,
  ApiResponse,
} from '@/types';
import { apiGet, apiPost, apiPut, apiDelete, extractData, extractPaginatedData, buildQueryString } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/config';

export const postsApi = {
  // Get all posts with pagination and filters
  getPosts: async (params?: PaginationParams): Promise<PaginatedResponse<Post>> => {
    const queryString = params ? buildQueryString(params) : '';
    const url = queryString ? `${API_ENDPOINTS.posts.list}?${queryString}` : API_ENDPOINTS.posts.list;
    
    const response = await apiGet<{ posts: Post[]; pagination: any }>(url);
    const result = extractData(response);
    
    return {
      data: result.posts || [],
      pagination: result.pagination || {},
    };
  },

  // Get featured posts
  getFeaturedPosts: async (limit?: number): Promise<Post[]> => {
    const url = limit 
      ? `${API_ENDPOINTS.posts.featured}?limit=${limit}`
      : API_ENDPOINTS.posts.featured;
    
    const response = await apiGet<{ posts: Post[] }>(url);
    const result = extractData(response);
    return result.posts || [];
  },

  // Get popular posts
  getPopularPosts: async (limit?: number): Promise<Post[]> => {
    const url = limit 
      ? `${API_ENDPOINTS.posts.popular}?limit=${limit}`
      : API_ENDPOINTS.posts.popular;
    
    const response = await apiGet<{ posts: Post[] }>(url);
    const result = extractData(response);
    return result.posts || [];
  },

  // Get my posts (authenticated user's posts)
  getMyPosts: async (params?: PaginationParams): Promise<PaginatedResponse<Post>> => {
    const queryString = params ? buildQueryString(params) : '';
    const url = queryString ? `${API_ENDPOINTS.posts.my}?${queryString}` : API_ENDPOINTS.posts.my;
    
    const response = await apiGet<{ posts: Post[]; pagination: any }>(url);
    const result = extractData(response);
    
    return {
      data: result.posts || [],
      pagination: result.pagination || {},
    };
  },

  // Get post by ID
  getPostById: async (id: string): Promise<Post> => {
    const response = await apiGet<{ post: Post }>(API_ENDPOINTS.posts.byId(id));
    const result = extractData(response);
    return result.post;
  },

  // Get post by slug
  getPostBySlug: async (slug: string): Promise<Post> => {
    const response = await apiGet<{ post: Post }>(API_ENDPOINTS.posts.bySlug(slug));
    const result = extractData(response);
    return result.post;
  },

  // Create new post
  createPost: async (data: CreatePostData): Promise<Post> => {
    const response = await apiPost<{ post: Post }>(
      API_ENDPOINTS.posts.create,
      data
    );
    const result = extractData(response);
    return result.post;
  },

  // Update post
  updatePost: async (id: string, data: UpdatePostData): Promise<Post> => {
    const response = await apiPut<{ post: Post }>(
      API_ENDPOINTS.posts.update(id),
      data
    );
    const result = extractData(response);
    return result.post;
  },

  // Delete post
  deletePost: async (id: string): Promise<void> => {
    await apiDelete(API_ENDPOINTS.posts.delete(id));
  },

  // Toggle like on post
  toggleLike: async (id: string): Promise<Post> => {
    const response = await apiPost<{ post: Post }>(
      API_ENDPOINTS.posts.like(id)
    );
    const result = extractData(response);
    return result.post;
  },

  // Get post statistics (for post owners/admins)
  getPostStats: async (id: string): Promise<PostStats> => {
    const response = await apiGet<{ stats: PostStats }>(
      API_ENDPOINTS.posts.stats(id)
    );
    const result = extractData(response);
    return result.stats;
  },

  // Search posts
  searchPosts: async (query: string, filters?: Partial<PaginationParams>): Promise<PaginatedResponse<Post>> => {
    const params = {
      search: query,
      ...filters,
    };
    
    return postsApi.getPosts(params);
  },

  // Get posts by category
  getPostsByCategory: async (category: string, params?: PaginationParams): Promise<PaginatedResponse<Post>> => {
    const searchParams = {
      category,
      ...params,
    };
    
    return postsApi.getPosts(searchParams);
  },

  // Get posts by tag
  getPostsByTag: async (tag: string, params?: PaginationParams): Promise<PaginatedResponse<Post>> => {
    const searchParams = {
      tags: tag,
      ...params,
    };
    
    return postsApi.getPosts(searchParams);
  },

  // Get posts by author
  getPostsByAuthor: async (authorId: string, params?: PaginationParams): Promise<PaginatedResponse<Post>> => {
    const searchParams = {
      author: authorId,
      ...params,
    };
    
    return postsApi.getPosts(searchParams);
  },
};

export default postsApi;