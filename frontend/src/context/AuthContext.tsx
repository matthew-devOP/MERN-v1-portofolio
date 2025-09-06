import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  QUERY_KEYS 
} from '@/types';
import { authApi } from '@/api/auth';
import { getAccessToken, setAccessToken, clearAuthTokens } from '@/utils/api';

// Auth state interface
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Auth actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGOUT' };

// Auth context interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refetch: () => void;
  isAdmin: boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const queryClient = useQueryClient();

  // Query to get current user
  const {
    data: userData,
    isLoading: isUserLoading,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: authApi.getCurrentUser,
    enabled: !!getAccessToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update state when user data changes
  useEffect(() => {
    if (!isUserLoading) {
      dispatch({ type: 'SET_USER', payload: userData?.user || null });
    }
  }, [userData, isUserLoading]);

  // Set initial loading state
  useEffect(() => {
    if (!getAccessToken()) {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data: AuthResponse) => {
      setAccessToken(data.accessToken);
      dispatch({ type: 'SET_USER', payload: data.user });
      queryClient.setQueryData(QUERY_KEYS.currentUser, { user: data.user });
      toast.success(`Welcome back, ${data.user.firstName}!`);
    },
    onError: (error: any) => {
      const message = error?.message || 'Login failed. Please try again.';
      toast.error(message);
      throw error;
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data: AuthResponse) => {
      setAccessToken(data.accessToken);
      dispatch({ type: 'SET_USER', payload: data.user });
      queryClient.setQueryData(QUERY_KEYS.currentUser, { user: data.user });
      toast.success(`Welcome to Blog Platform, ${data.user.firstName}!`);
    },
    onError: (error: any) => {
      const message = error?.message || 'Registration failed. Please try again.';
      toast.error(message);
      throw error;
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuthTokens();
      dispatch({ type: 'LOGOUT' });
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: (error: any) => {
      // Even if logout fails on server, clear local state
      clearAuthTokens();
      dispatch({ type: 'LOGOUT' });
      queryClient.clear();
      const message = error?.message || 'Logout failed';
      toast.error(message);
    },
  });

  // Logout all devices mutation
  const logoutAllMutation = useMutation({
    mutationFn: authApi.logoutAll,
    onSuccess: () => {
      clearAuthTokens();
      dispatch({ type: 'LOGOUT' });
      queryClient.clear();
      toast.success('Logged out from all devices');
    },
    onError: (error: any) => {
      clearAuthTokens();
      dispatch({ type: 'LOGOUT' });
      queryClient.clear();
      const message = error?.message || 'Logout failed';
      toast.error(message);
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      dispatch({ type: 'SET_USER', payload: data.user });
      queryClient.setQueryData(QUERY_KEYS.currentUser, { user: data.user });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update profile';
      toast.error(message);
      throw error;
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      clearAuthTokens();
      dispatch({ type: 'LOGOUT' });
      queryClient.clear();
      toast.success('Password changed successfully. Please log in again.');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to change password';
      toast.error(message);
      throw error;
    },
  });

  // Context value
  const contextValue: AuthContextType = {
    ...state,
    isLoading: state.isLoading || loginMutation.isPending || registerMutation.isPending,
    isAdmin: state.user?.role === 'admin',
    
    login: async (credentials: LoginCredentials) => {
      await loginMutation.mutateAsync(credentials);
    },
    
    register: async (data: RegisterData) => {
      await registerMutation.mutateAsync(data);
    },
    
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    
    logoutAll: async () => {
      await logoutAllMutation.mutateAsync();
    },
    
    updateProfile: async (data: Partial<User>) => {
      await updateProfileMutation.mutateAsync(data);
    },
    
    changePassword: async (currentPassword: string, newPassword: string) => {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
    },
    
    refetch,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected routes
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requireAdmin = false
) => {
  const AuthenticatedComponent = (props: P) => {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner-lg" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Authentication Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please log in to access this page.
            </p>
            <a
              href="/login"
              className="btn-primary"
            >
              Go to Login
            </a>
          </div>
        </div>
      );
    }

    if (requireAdmin && !isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
};

export default AuthContext;