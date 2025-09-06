// MongoDB initialization script
// This script runs when MongoDB container starts for the first time

// Switch to the blog platform database
db = db.getSiblingDB('blog_platform');

// Create a user for the application
db.createUser({
  user: 'bloguser',
  pwd: 'blogpassword',
  roles: [
    {
      role: 'readWrite',
      db: 'blog_platform',
    },
  ],
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password', 'firstName', 'lastName'],
      properties: {
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30,
          description: 'Username must be a string between 3-30 characters',
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address',
        },
        role: {
          bsonType: 'string',
          enum: ['user', 'admin'],
          description: 'Role must be either user or admin',
        },
      },
    },
  },
});

db.createCollection('posts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'content', 'author'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 5,
          maxLength: 200,
          description: 'Title must be a string between 5-200 characters',
        },
        content: {
          bsonType: 'string',
          minLength: 10,
          description: 'Content must be at least 10 characters long',
        },
        published: {
          bsonType: 'bool',
          description: 'Published must be a boolean',
        },
      },
    },
  },
});

db.createCollection('comments', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['content', 'author', 'post'],
      properties: {
        content: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 1000,
          description: 'Content must be between 1-1000 characters',
        },
      },
    },
  },
});

// Create indexes for better performance
// User indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

// Post indexes
db.posts.createIndex({ author: 1 });
db.posts.createIndex({ published: 1 });
db.posts.createIndex({ createdAt: -1 });
db.posts.createIndex({ publishedAt: -1 });
db.posts.createIndex({ slug: 1 }, { unique: true });
db.posts.createIndex({ category: 1 });
db.posts.createIndex({ tags: 1 });
db.posts.createIndex({ featured: 1 });
db.posts.createIndex({ title: 'text', content: 'text', excerpt: 'text' });

// Comment indexes
db.comments.createIndex({ post: 1 });
db.comments.createIndex({ author: 1 });
db.comments.createIndex({ parent: 1 });
db.comments.createIndex({ createdAt: -1 });
db.comments.createIndex({ isApproved: 1 });
db.comments.createIndex({ isDeleted: 1 });

// Create sample admin user (for development)
db.users.insertOne({
  username: 'admin',
  email: 'admin@blogplatform.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewNZWe/2LGUEoL/.', // password123
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  isActive: true,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Create sample regular user (for development)
db.users.insertOne({
  username: 'testuser',
  email: 'user@blogplatform.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewNZWe/2LGUEoL/.', // password123
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  isActive: true,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

print('MongoDB initialization completed successfully!');
print('Sample users created:');
print('- Admin: admin@blogplatform.com / password123');
print('- User: user@blogplatform.com / password123');