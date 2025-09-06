import React from 'react';

const MyPostsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          My Posts
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Manage your published and draft posts.
        </p>
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-primary-900 dark:text-primary-100 mb-2">
            Coming Soon!
          </h2>
          <p className="text-primary-700 dark:text-primary-300">
            This page will feature:
          </p>
          <ul className="text-left mt-4 space-y-1 text-primary-700 dark:text-primary-300">
            <li>• List of your published posts</li>
            <li>• Draft posts management</li>
            <li>• Post analytics and stats</li>
            <li>• Quick edit and delete actions</li>
            <li>• Publishing status controls</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyPostsPage;