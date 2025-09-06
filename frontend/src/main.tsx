import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { isDevelopment } from './utils/config';

import './index.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401, 403, or 404 errors
        if (error?.response?.status === 401 || 
            error?.response?.status === 403 || 
            error?.response?.status === 404) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: false,
    },
  },
});

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // In production, you might want to send this to an error reporting service
    if (!isDevelopment) {
      // Example: sendErrorToService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Refresh Page
            </button>
            {isDevelopment && this.state.error && (
              <details className="mt-6 text-left bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <summary className="cursor-pointer font-medium text-red-800 dark:text-red-200">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Service Worker registration
const registerSW = async () => {
  if ('serviceWorker' in navigator && !isDevelopment) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  }
};

// Initialize app
const initApp = () => {
  const root = ReactDOM.createRoot(document.getElementById('root')!);

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AuthProvider>
                <App />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    className: 'dark:bg-gray-800 dark:text-white',
                    style: {
                      background: 'var(--toast-bg)',
                      color: 'var(--toast-color)',
                    },
                  }}
                />
              </AuthProvider>
            </ThemeProvider>
            {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
          </QueryClientProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );

  // Register service worker
  registerSW();
};

// Start the app
initApp();