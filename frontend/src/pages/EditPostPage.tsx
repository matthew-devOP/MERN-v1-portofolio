import React from 'react';

const EditPostPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Edit Post
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Update your blog post.
        </p>
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-primary-900 dark:text-primary-100 mb-2">
            Coming Soon!
          </h2>
          <p className="text-primary-700 dark:text-primary-300">
            This page will feature the same capabilities as the create post page but pre-filled with existing post data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditPostPage;