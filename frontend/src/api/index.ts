// Re-export all API modules for convenient importing
export { authApi } from './auth';
export { postsApi } from './posts';
export { commentsApi } from './comments';
export { uploadApi } from './upload';

// Re-export API utilities
export {
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
} from '@/utils/api';

export default {
  auth: () => import('./auth'),
  posts: () => import('./posts'),
  comments: () => import('./comments'),
  upload: () => import('./upload'),
};