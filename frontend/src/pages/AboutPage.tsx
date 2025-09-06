import React from 'react';
import { Link } from 'react-router-dom';
import { GitHub, Mail, Heart } from 'lucide-react';

import Button from '@/components/ui/Button';
import { env } from '@/utils/config';

const AboutPage: React.FC = () => {
  const features = [
    {
      title: 'Modern Technology Stack',
      description: 'Built with the latest MERN stack technologies including React 18, TypeScript, Node.js, and MongoDB.',
    },
    {
      title: 'Secure Authentication',
      description: 'JWT-based authentication with refresh tokens and role-based access control for enhanced security.',
    },
    {
      title: 'Rich Content Creation',
      description: 'Create beautiful posts with markdown support, image uploads, and advanced formatting options.',
    },
    {
      title: 'Interactive Community',
      description: 'Engage with readers through comments, likes, and social features in a vibrant community.',
    },
    {
      title: 'Responsive Design',
      description: 'Fully responsive design that works perfectly on desktop, tablet, and mobile devices.',
    },
    {
      title: 'Dark Mode Support',
      description: 'Built-in dark mode support with system preference detection for comfortable reading.',
    },
  ];

  const techStack = [
    { name: 'Frontend', technologies: ['React 18', 'TypeScript', 'Tailwind CSS', 'Vite'] },
    { name: 'Backend', technologies: ['Node.js', 'Express.js', 'JWT', 'Redis'] },
    { name: 'Database', technologies: ['MongoDB', 'Mongoose'] },
    { name: 'DevOps', technologies: ['Docker', 'Docker Compose', 'Nginx'] },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About {env.APP_NAME}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {env.APP_NAME} is a modern, full-stack blog platform designed for 
            developers, writers, and content creators who value quality, performance, 
            and user experience.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
              We believe in creating a platform that empowers writers and developers 
              to share their knowledge, experiences, and insights with the world. Our 
              goal is to build a community where quality content thrives and meaningful 
              connections are made.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Performance
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Lightning-fast loading times and smooth user experience
                </p>
              </div>
              <div>
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Security
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enterprise-grade security with modern authentication
                </p>
              </div>
              <div>
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Community
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Building connections between writers and readers globally
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Platform Features
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover the powerful features that make our platform stand out
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card">
                <div className="card-body">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Technology Stack
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built with modern, production-ready technologies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((category, index) => (
              <div key={index} className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                </div>
                <div className="card-body">
                  <ul className="space-y-2">
                    {category.technologies.map((tech, techIndex) => (
                      <li key={techIndex} className="text-gray-600 dark:text-gray-400">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <Heart className="h-12 w-12 text-primary-600" fill="currentColor" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Open Source & Community Driven
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              This project is open source and available on GitHub. We welcome 
              contributions from developers around the world who want to help 
              improve the platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as="a"
                href="https://github.com/matthew-devOP/MERN-v1-portofolio"
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                leftIcon={<GitHub className="h-5 w-5" />}
              >
                View on GitHub
              </Button>
              <Button
                as={Link}
                to="/register"
                variant="outline"
                leftIcon={<Mail className="h-5 w-5" />}
              >
                Join Community
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Have questions, suggestions, or want to contribute? We'd love to hear from you.
          </p>
          <div className="flex justify-center space-x-6">
            <a
              href="https://github.com/matthew-devOP/MERN-v1-portofolio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <GitHub className="h-6 w-6" />
            </a>
            <a
              href="mailto:contact@blogplatform.com"
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Mail className="h-6 w-6" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;