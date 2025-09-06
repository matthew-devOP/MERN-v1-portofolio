import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Star, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { postsApi } from '@/api/posts';
import { QUERY_KEYS } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { env } from '@/utils/config';

const HomePage: React.FC = () => {
  // Fetch featured posts
  const { data: featuredPosts, isLoading: featuredLoading } = useQuery({
    queryKey: QUERY_KEYS.featuredPosts(3),
    queryFn: () => postsApi.getFeaturedPosts(3),
  });

  // Fetch popular posts
  const { data: popularPosts, isLoading: popularLoading } = useQuery({
    queryKey: QUERY_KEYS.popularPosts(5),
    queryFn: () => postsApi.getPopularPosts(5),
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                {env.APP_NAME}
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              A modern blog platform built with the MERN stack. Share your thoughts, 
              connect with others, and discover amazing content from our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as={Link}
                to="/posts"
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Explore Posts
              </Button>
              <Button
                as={Link}
                to="/register"
                variant="outline"
                size="lg"
              >
                Join Community
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 dark:bg-primary-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Community</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Join thousands of writers and readers sharing knowledge
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-success-100 dark:bg-success-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-success-600 dark:text-success-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Trending</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Discover trending topics and popular discussions
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-warning-100 dark:bg-warning-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-warning-600 dark:text-warning-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Quality</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                High-quality content curated by our community
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Posts
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Check out these hand-picked posts from our community
            </p>
          </div>

          {featuredLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" text="Loading featured posts..." />
            </div>
          ) : featuredPosts && featuredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {featuredPosts.map((post) => (
                <article key={post.id} className="card hover:shadow-md transition-shadow">
                  {post.featuredImage && (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="card-body">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="badge badge-primary">Featured</span>
                      {post.category && (
                        <span className="badge badge-gray">{post.category}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {post.author.avatar ? (
                          <img
                            src={post.author.avatar}
                            alt={post.author.firstName}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">
                              {post.author.firstName?.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {post.author.firstName} {post.author.lastName}
                        </span>
                      </div>
                      <Link
                        to={`/posts/${post.slug}`}
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                      >
                        Read more
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-400">
              No featured posts available at the moment.
            </div>
          )}

          <div className="text-center">
            <Button
              as={Link}
              to="/posts"
              variant="outline"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              View All Posts
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Posts Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-2/3">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Trending This Week
              </h2>

              {popularLoading ? (
                <LoadingSpinner size="lg" text="Loading popular posts..." />
              ) : popularPosts && popularPosts.length > 0 ? (
                <div className="space-y-6">
                  {popularPosts.map((post, index) => (
                    <article key={post.id} className="flex items-center space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <Link
                          to={`/posts/${post.slug}`}
                          className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-1"
                        >
                          {post.title}
                        </Link>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span>{post.author.firstName} {post.author.lastName}</span>
                          <span>•</span>
                          <span>{post.views} views</span>
                          <span>•</span>
                          <span>{post.likesCount} likes</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-gray-600 dark:text-gray-400">
                  No popular posts available at the moment.
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Get Started
                  </h3>
                </div>
                <div className="card-body space-y-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Ready to share your thoughts with the world?
                  </p>
                  <div className="space-y-2">
                    <Button
                      as={Link}
                      to="/register"
                      variant="primary"
                      size="sm"
                      fullWidth
                    >
                      Create Account
                    </Button>
                    <Button
                      as={Link}
                      to="/posts/new"
                      variant="outline"
                      size="sm"
                      fullWidth
                    >
                      Write Your First Post
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;