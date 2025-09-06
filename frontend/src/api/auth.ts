import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User,
  ApiResponse 
} from '@/types';
import { apiPost, apiGet, apiPut, extractData } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/config';

export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiPost<AuthResponse>(
      API_ENDPOINTS.auth.login,
      credentials
    );
    return extractData(response);
  },

  // Register user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiPost<AuthResponse>(
      API_ENDPOINTS.auth.register,
      data
    );
    return extractData(response);
  },

  // Refresh access token
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiPost<AuthResponse>(API_ENDPOINTS.auth.refresh);
    return extractData(response);
  },

  // Logout current session
  logout: async (): Promise<void> => {
    await apiPost(API_ENDPOINTS.auth.logout);
  },

  // Logout all sessions
  logoutAll: async (): Promise<void> => {
    await apiPost(API_ENDPOINTS.auth.logoutAll);
  },

  // Get current user
  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await apiGet<{ user: User }>(API_ENDPOINTS.auth.me);
    return extractData(response);
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<{ user: User }> => {
    const response = await apiPut<{ user: User }>(
      API_ENDPOINTS.auth.profile,
      data
    );
    return extractData(response);
  },

  // Change password
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await apiPut<{ message: string }>(
      API_ENDPOINTS.auth.changePassword,
      {
        currentPassword,
        newPassword,
      }
    );
    return extractData(response);
  },
};

export default authApi;