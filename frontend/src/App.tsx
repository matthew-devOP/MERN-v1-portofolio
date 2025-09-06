import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const PostsPage = React.lazy(() => import('@/pages/PostsPage'));
const PostPage = React.lazy(() => import('@/pages/PostPage'));
const CreatePostPage = React.lazy(() => import('@/pages/CreatePostPage'));
const EditPostPage = React.lazy(() => import('@/pages/EditPostPage'));
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage'));
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));
const MyPostsPage = React.lazy(() => import('@/pages/MyPostsPage'));
const SearchPage = React.lazy(() => import('@/pages/SearchPage'));
const AboutPage = React.lazy(() => import('@/pages/AboutPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false,
  requireAdmin = false,
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Redirect to login if authentication is required
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access this page.
          </p>
          <a
            href="/login"
            className="btn-primary"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Check admin permission
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this page.
          </p>
          <a
            href="/"
            className="btn-primary"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text="Loading page..." />
  </div>
);

// Main App Component
const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/posts/:slug" element={<PostPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/about" element={<AboutPage />} />
            
            {/* Auth Routes (redirect to home if already authenticated) */}
            <Route 
              path="/login" 
              element={
                <AuthRoute>
                  <LoginPage />
                </AuthRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <AuthRoute>
                  <RegisterPage />
                </AuthRoute>
              } 
            />
            
            {/* Protected Routes - Require Authentication */}
            <Route 
              path="/posts/new" 
              element={
                <ProtectedRoute requireAuth>
                  <CreatePostPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/posts/:id/edit" 
              element={
                <ProtectedRoute requireAuth>
                  <EditPostPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute requireAuth>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute requireAuth>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-posts" 
              element={
                <ProtectedRoute requireAuth>
                  <MyPostsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes - Require Admin Role */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requireAuth requireAdmin>
                  <AdminRoutes />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
};

// Auth Route component (redirect if already authenticated)
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (isAuthenticated) {
    // Redirect to home if already authenticated
    window.location.href = '/';
    return null;
  }

  return <>{children}</>;
};

// Admin Routes component
const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/posts" element={<AdminPosts />} />
      <Route path="/users" element={<AdminUsers />} />
      <Route path="/comments" element={<AdminComments />} />
      <Route path="/settings" element={<AdminSettings />} />
    </Routes>
  );
};

// Placeholder admin components (to be implemented later)
const AdminDashboard = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
    <p className="text-gray-600 dark:text-gray-400 mt-2">
      Welcome to the admin panel. This feature is coming soon!
    </p>
  </div>
);

const AdminPosts = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold">Manage Posts</h1>
    <p className="text-gray-600 dark:text-gray-400 mt-2">
      Manage all posts in the system.
    </p>
  </div>
);

const AdminUsers = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold">Manage Users</h1>
    <p className="text-gray-600 dark:text-gray-400 mt-2">
      Manage user accounts and permissions.
    </p>
  </div>
);

const AdminComments = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold">Manage Comments</h1>
    <p className="text-gray-600 dark:text-gray-400 mt-2">
      Moderate comments and manage spam.
    </p>
  </div>
);

const AdminSettings = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold">Admin Settings</h1>
    <p className="text-gray-600 dark:text-gray-400 mt-2">
      Configure system settings and preferences.
    </p>
  </div>
);

export default App;