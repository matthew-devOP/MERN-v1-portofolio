# Technology Stack Analysis - MERN Stack Blog Platform

## Table of Contents

1. [Frontend Technologies](#frontend-technologies)
2. [Backend Architecture](#backend-architecture)
3. [Build and Development Tools](#build-and-development-tools)
4. [Architecture Decisions](#architecture-decisions)

## Frontend Technologies

### Core Framework

**React v18.2.0**

-   **Purpose**: To build a dynamic, interactive Single Page Application (SPA) with component-based architecture.
-   **Rationale**: React 18 introduces concurrent features and automatic batching, improving performance for complex UIs. The functional component paradigm with Hooks simplifies state logic reusability.
-   **Key Features Used**:
    -   `Context API`: For global auth state management (`AuthContext`).
    -   `Custom Hooks`: Modular logic for form handling and API calls.

### State Management & Data Fetching

**TanStack React Query v5.8.4**

-   **Purpose**: Managing server state, caching, and synchronization.
-   **Rationale**: Eliminates the need for complex global state stores (Redux) for server data. It handles caching, deduplication, and background updates out-of-the-box.
-   **Key Features Used**:
    -   `useQuery`: Fetching posts, comments, and user profiles.
    -   `useMutation`: Handling post creation, updates, and login actions.
    -   **Invalidation**: Automatic refetching of lists after mutations (e.g., refreshing comments after posting one).

### Styling & UI Components

**Tailwind CSS v3.3.5** & **Headless UI v1.7.17**

-   **Purpose**: Rapid utility-first styling and accessible UI primitives.
-   **Rationale**: Tailwind allows for distinct, consistency design tokens without context-switching to CSS files. Headless UI provides unstyled, accessible components (Dialogs, Menu, Transitions) that integrate perfectly with Tailwind.
-   **Key Features Used**:
    -   **Dark Mode**: Native support via `dark:` modifiers.
    -   **Responsive Design**: Mobile-first breakpoints (`sm`, `md`, `lg`).

### Form Handling

**React Hook Form v7.47.0** + **Zod v3.22.4**

-   **Purpose**: Efficient form management with schema-based validation.
-   **Rationale**: React Hook Form minimizes re-renders compared to controlled components. Zod provides TypeScript-first schema declaration, ensuring runtime validation matches compile-time types.

## Backend Architecture

### Runtime & Framework

**Node.js** & **Express v4.18.2**

-   **Purpose**: High-performance, event-driven server environment.
-   **Rationale**: JavaScript on both ends (Universal JS) allows for shared logic and types. Express provides a minimalist, unopinionated routing layer that is easy to extend with middleware.

### Database Layer

**MongoDB** & **Mongoose v7.6.3**

-   **Purpose**: NoSQL document storage.
-   **Rationale**: Flexible schema design matches JSON data structure of frontend. Mongoose provides robust object modeling, validation, and middleware (hooks) for data integrity.

### Caching Layer

**Redis v4.6.10**

-   **Purpose**: In-memory data structure store for caching and session management.
-   **Rationale**: Significantly reduces database load by caching frequently read data (e.g., popular posts, user sessions).
-   **Configuration**:
    -   `rate-limit-redis`: Persists rate limit counters for distributed security.

### Authentication & Security

**JsonWebToken (JWT) v9.0.2** & **BcryptJS**

-   **Purpose**: Stateless authentication and password security.
-   **Rationale**: JWTs allow the backend to be stateless and scalable. Bcrypt ensures password hashes are resistant to rainbow table attacks.

## Build and Development Tools

### Bundler & Tooling

**Vite v4.5.0**

-   **Purpose**: Next-generation frontend tooling.
-   **Features**:
    -   **HMR (Hot Module Replacement)**: Instant server updates.
    -   **Builds**: Rollup-based production builds with optimized asset splitting.
-   **Rationale**: Orders of magnitude faster than Webpack, essential for modern developer experience.

### Containerization

**Docker** & **Docker Compose**

-   **Purpose**: Containerization of application services.
-   **Configuration**: `docker-compose.yml` orchestrates:
    -   `frontend` (React/Nginx)
    -   `backend` (Node API)
    -   `mongodb` (Database)
    -   `redis` (Cache)
-   **Rationale**: Ensures "works on my machine" consistency across all development and production environments.

### Testing

**Vitest** (Frontend) & **Jest** (Backend)

-   **Purpose**: Unit and Integration testing.
-   **Rationale**: Vitest offers native Vite support for blazingly fast frontend tests. Jest is the industry standard for Node.js backend testing.

## Architecture Decisions

### Modular Service Pattern

The backend is structured into `controllers`, `services`, and `models`.
-   **Why**: Separation of concerns. Controllers handle HTTP (req/res), Services hold business logic, and Models handle data access. This makes the code testable and reusable.

### TypeScript Throughout

Both Frontend and Backend use TypeScript.
-   **Why**: Shared interfaces (contracts) between frontend and backend prevent data shape mismatch errors. It provides self-documenting code and superior IDE refactoring tools.

### Refresh Token Rotation

The auth system uses a dual-token strategy (Access + Refresh).
-   **Why**: Balances security and UX. Access tokens are short-lived (security), while opaque Refresh tokens allow users to stay logged in (UX) but can be revoked server-side if compromised.
