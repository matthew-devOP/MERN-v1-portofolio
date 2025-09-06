import {
  Comment,
  CreateCommentData,
  UpdateCommentData,
  PaginationParams,
  PaginatedResponse,
} from '@/types';
import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  extractData,
  buildQueryString 
} from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/config';

export const commentsApi = {
  // Get comments for a specific post
  getPostComments: async (
    postId: string, 
    params?: PaginationParams
  ): Promise<PaginatedResponse<Comment>> => {
    const queryString = params ? buildQueryString(params) : '';
    const url = queryString 
      ? `${API_ENDPOINTS.comments.postComments(postId)}?${queryString}`
      : API_ENDPOINTS.comments.postComments(postId);
    
    const response = await apiGet<{ comments: Comment[]; pagination: any }>(url);
    const result = extractData(response);
    
    return {
      data: result.comments || [],
      pagination: result.pagination || {},
    };
  },

  // Get replies for a specific comment
  getCommentReplies: async (
    commentId: string, 
    params?: PaginationParams
  ): Promise<PaginatedResponse<Comment>> => {
    const queryString = params ? buildQueryString(params) : '';
    const url = queryString 
      ? `${API_ENDPOINTS.comments.replies(commentId)}?${queryString}`
      : API_ENDPOINTS.comments.replies(commentId);
    
    const response = await apiGet<{ replies: Comment[]; pagination: any }>(url);
    const result = extractData(response);
    
    return {
      data: result.replies || [],
      pagination: result.pagination || {},
    };
  },

  // Get current user's comments
  getMyComments: async (params?: PaginationParams): Promise<PaginatedResponse<Comment>> => {
    const queryString = params ? buildQueryString(params) : '';
    const url = queryString 
      ? `${API_ENDPOINTS.comments.my}?${queryString}`
      : API_ENDPOINTS.comments.my;
    
    const response = await apiGet<{ comments: Comment[]; pagination: any }>(url);
    const result = extractData(response);
    
    return {
      data: result.comments || [],
      pagination: result.pagination || {},
    };
  },

  // Create a new comment
  createComment: async (data: CreateCommentData): Promise<Comment> => {
    const response = await apiPost<{ comment: Comment }>(
      API_ENDPOINTS.comments.create,
      data
    );
    const result = extractData(response);
    return result.comment;
  },

  // Update a comment
  updateComment: async (id: string, data: UpdateCommentData): Promise<Comment> => {
    const response = await apiPut<{ comment: Comment }>(
      API_ENDPOINTS.comments.update(id),
      data
    );
    const result = extractData(response);
    return result.comment;
  },

  // Delete a comment
  deleteComment: async (id: string): Promise<void> => {
    await apiDelete(API_ENDPOINTS.comments.delete(id));
  },

  // Toggle like on a comment
  toggleCommentLike: async (id: string): Promise<Comment> => {
    const response = await apiPost<{ comment: Comment }>(
      API_ENDPOINTS.comments.like(id)
    );
    const result = extractData(response);
    return result.comment;
  },

  // Moderate a comment (admin only)
  moderateComment: async (
    id: string, 
    action: 'approve' | 'reject' | 'delete'
  ): Promise<Comment> => {
    const response = await apiPost<{ comment: Comment }>(
      API_ENDPOINTS.comments.moderate(id),
      { action }
    );
    const result = extractData(response);
    return result.comment;
  },

  // Reply to a comment (convenience method)
  replyToComment: async (
    postId: string,
    parentCommentId: string,
    content: string
  ): Promise<Comment> => {
    return commentsApi.createComment({
      content,
      postId,
      parentId: parentCommentId,
    });
  },

  // Get comment thread (comment + all its nested replies)
  getCommentThread: async (commentId: string): Promise<Comment[]> => {
    const { data: replies } = await commentsApi.getCommentReplies(commentId, {
      limit: 100, // Get all replies
      sort: 'createdAt', // Oldest first for threading
    });
    
    return replies;
  },

  // Count comments for a post (alternative to API if not available)
  getCommentCount: async (postId: string): Promise<number> => {
    const { pagination } = await commentsApi.getPostComments(postId, {
      limit: 1, // Just get pagination info
    });
    
    return pagination.total || 0;
  },
};

export default commentsApi;