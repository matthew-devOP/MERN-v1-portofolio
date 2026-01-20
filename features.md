# Core Features Documentation - MERN Stack Blog Platform

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Post Management Engine](#post-management-engine)
3. [Interactive Comment System](#interactive-comment-system)
4. [Search & Discovery](#search--discovery)
5. [Media Management](#media-management)
6. [User Profile & Settings](#user-profile--settings)
7. [System Configuration & Security](#system-configuration--security)

## Authentication & Authorization

### Description
A robust, secure authentication system using JSON Web Tokens (JWT) with refresh token rotation mechanisms to ensure long-term session security without compromising user credentials. It supports Role-Based Access Control (RBAC) to differentiate between standard users and system administrators.

### User Workflow
1.  **Registration**: User signs up with email, username, and password.
2.  **Login**: User authenticates; system issues short-lived Access Token (15m) and long-lived Refresh Token (7d).
3.  **Session Maintenance**: Client automatically rotates tokens transparently when the access token expires.
4.  **Logout**: Tokens are invalidated server-side to prevent replay attacks.

### Technical Implementation

#### Component Structure
-   **Frontend**: `src/context/AuthContext.tsx` handles token storage and auto-refresh logic.
-   **Backend**: `src/middleware/auth.js` verifies tokens and creates user context.

#### Security Logic
```typescript
// User Model - Password Hashing Middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

#### Business Rules
-   **Password Strength**: Minimum 6 characters.
-   **Token Expiry**: Access Token (15 mins), Refresh Token (30 days).
-   **Lockout**: Account locking is prepared for future brute-force protection implementation.

## Post Management Engine

### Description
The core content engine allowing users to author, publish, and manage rich-text articles. It features automatic slug generation, reading time calculation, and metadata management for SEO.

### User Workflow
1.  **Creation**: User accesses `CreatePostPage`, enters title, content, and tags.
2.  **Drafting**: Posts can be saved as drafts (unpublished) or published immediately.
3.  **Viewing**: Public users view posts on `PostPage` with formatting and media.
4.  **Interaction**: Users can "like" posts; authors can edit or delete their own content.

### Technical Implementation

#### Data Structure
```typescript
interface Post {
  title: string;
  slug: string;        // URL-friendly unique identifier
  content: string;     // Markdown/HTML content
  tags: string[];      // Categorization
  published: boolean;  // Visibility state
  readingTime: number; // Virtual field calculated automatically
  views: number;       // Engagement tracking
}
```

#### Key Logic: Slug Generation
```javascript
// Post Model - Pre-save Hook
postSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '') // Remove non-word chars
      .replace(/ +/g, '-')     // Replace spaces with dashes
      + '-' + Date.now();      // Ensure uniqueness
  }
  next();
});
```

### Business Rules
-   **Uniqueness**: Slugs must be unique system-wide.
-   **Validation**: Title min length 5 chars; Content min length 10 chars.
-   **Ownership**: only the original author or an Admin can edit/delete a post.

## Interactive Comment System

### Description
A threaded commenting engine that facilitates community discussion. It supports nested replies, soft deletions, and an approval workflow for content moderation.

### User Workflow
1.  **Commenting**: Authenticated user posts a comment on an article.
2.  **Replying**: Users can reply to specific comments, creating a nested thread.
3.  **Moderation**: Comments are visible immediately (default) or require approval (configurable).
4.  **Management**: Authors can delete their comments (soft delete).

### Technical Implementation

#### Component Structure
-   **Frontend**: `CommentSection.tsx` handles the recursive rendering of comment threads.
-   **Backend**: `Comment.js` model with self-referencing `parent` field.

#### Interface Details
```typescript
interface Comment {
  id: string;
  content: string;
  author: User;
  post: string;
  parent?: string; // ID of parent comment for nesting
  replies?: Comment[]; // Virtual populated field
  isDeleted: boolean; // Soft delete flag
}
```

### Business Rules
-   **Nesting Limit**: UI supports virtually infinite nesting, but practical display depth is usually capped at 3-5 levels.
-   **Soft Delete**: Deleted comments remain in DB (`isDeleted: true`) to preserve thread structure but content is hidden.

## Search & Discovery

### Description
Advanced filtering and search capabilities allowing users to find content by keywords, categories, or tags. Includes sorting options for "Trending" (most views/likes) and "Recent".

### User Workflow
1.  **Search Input**: User types query in `SearchPage`.
2.  **Filtering**: User selects specific tags or categories from the sidebar.
3.  **Sorting**: User toggles between "Latest" and "Popular".

### Technical Implementation

#### Search Logic
-   **Text Indexing**: MongoDB text indexes on `title`, `content`, and `excerpt`.
-   **Aggregation**: Uses MongoDB aggregation pipeline to sort by calculated fields like `likesCount`.

#### Frontend Integration
```typescript
// React Query Hook Usage
const { data: popularPosts } = useQuery({
  queryKey: ['posts', 'popular', 5],
  queryFn: () => postsApi.getPopularPosts(5),
});
```

## Media Management

### Description
Integrated file upload system using Cloudinary, allowing users to attach high-quality featured images to their posts and update user avatars.

### User Workflow
1.  **Upload**: User selects an image file in the UI.
2.  **Processing**: File is sent to backend -> streamed to Cloudinary.
3.  **Storage**: Cloudinary returns a secure URL, which is stored in the Post/User document.

### Technical Implementation
-   **Backend**: `upload.js` route uses `multer` for memory storage and Cloudinary SDK for cloud upload.
-   **Optimization**: Automatic format selection (WebP/AVIF) and resizing provided by Cloudinary.

## User Profile & Settings

### Description
Personalized dashboard for users to manage their identity and preferences.

### User Workflow
1.  **Profile View**: Public view showing avatar, bio, and authored posts.
2.  **Edit Profile**: Private view to update bio, password, or avatar.
3.  **My Posts**: Dashboard to access draft and published articles.

### Technical Implementation
```typescript
interface UserProfile {
  username: string;
  bio?: string;
  avatar?: string; // URL from Cloudinary
  emailVerified: boolean;
  role: 'user' | 'admin';
}
```

## System Configuration & Security

### Description
Backend configuration handling rate limiting, data validation, and security headers to protect the platform integrity.

### Features
-   **Rate Limiting**: Limits requests per IP (100 reqs/15min) to prevent abuse.
-   **Input Validation**: `Joi` schemas validate all incoming API payloads (registration data, post content).
-   **Security Headers**: `Helmet` middleware adds standard security headers (X-XSS-Protection, HSTS).
-   **CORS**: Configured to strictly allow requests only from the trusted frontend domain.
