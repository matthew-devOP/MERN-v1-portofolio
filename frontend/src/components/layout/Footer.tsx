import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, GitHub, Twitter, Mail } from 'lucide-react';

import { env } from '@/utils/config';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Blog', href: '/posts' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
    developers: [
      { name: 'API Documentation', href: '/api/docs' },
      { name: 'GitHub Repository', href: 'https://github.com/matthew-devOP/MERN-v1-portofolio' },
      { name: 'Contributing', href: '/contributing' },
    ],
  };

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/matthew-devOP/MERN-v1-portofolio', icon: GitHub },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Email', href: 'mailto:contact@blogplatform.com', icon: Mail },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {env.APP_NAME}
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              A modern blog platform built with the MERN stack, featuring 
              authentication, posts, comments, and file uploads. Perfect for 
              developers and content creators.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={item.name}
                >
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Developers
            </h3>
            <ul className="space-y-2">
              {footerLinks.developers.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <span>&copy; {currentYear} {env.APP_NAME}. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 mt-4 md:mt-0">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
              <span>using MERN Stack</span>
            </div>
          </div>
          
          {/* Version and Build Info */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>Version {env.APP_VERSION}</span>
              <span>•</span>
              <span>Built with React 18 + TypeScript</span>
              <span>•</span>
              <span>Powered by Node.js + MongoDB</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;