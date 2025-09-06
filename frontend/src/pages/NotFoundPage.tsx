import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

import Button from '@/components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-gray-200 dark:text-gray-700 mb-4">
            404
          </div>
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 rounded-full flex items-center justify-center">
            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist. It might have been moved, 
          deleted, or you entered the wrong URL.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              as={Link}
              to="/"
              variant="primary"
              leftIcon={<Home className="h-4 w-4" />}
            >
              Go Home
            </Button>
            
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Go Back
            </Button>
          </div>

          {/* Search Suggestion */}
          <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Looking for something specific?
            </p>
            <div className="flex gap-2">
              <input
                type="search"
                placeholder="Search posts..."
                className="form-input flex-1 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value;
                    if (query.trim()) {
                      window.location.href = `/search?q=${encodeURIComponent(query)}`;
                    }
                  }
                }}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const input = document.querySelector('input[type="search"]') as HTMLInputElement;
                  const query = input?.value;
                  if (query?.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                  }
                }}
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Popular pages:
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <Link
              to="/posts"
              className="link-underline"
            >
              All Posts
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link
              to="/about"
              className="link-underline"
            >
              About
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link
              to="/register"
              className="link-underline"
            >
              Join Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;