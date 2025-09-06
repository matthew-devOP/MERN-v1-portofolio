# MERN Stack Blog Platform 🚀

Un platform de blog modern și scalabil construit cu tehnologiile MERN Stack (MongoDB, Express.js, React, Node.js) și TypeScript, containerizat cu Docker pentru deployment-uri robuste.

## 🌟 Features

### Frontend (React 18 + TypeScript)
- **Autentificare completă** cu JWT și refresh tokens
- **Interfață responsive** cu Tailwind CSS și dark mode
- **Routing protejat** cu React Router 6
- **State management** cu React Query și Context API
- **Formulare validate** cu React Hook Form și Zod
- **Componente UI reutilizabile** cu design modern
- **SEO optimized** cu meta tags dinamice
- **Progressive Web App** ready

### Backend (Node.js + Express)
- **Arhitectură modulară** cu servicii separate
- **Autentificare JWT** cu refresh token rotation
- **Role-Based Access Control (RBAC)** pentru admin/user
- **Validare robustă** cu Joi și middleware custom
- **File upload** cu Cloudinary integration
- **Caching** cu Redis pentru performanță optimă
- **Rate limiting** și securitate avansată
- **Logging** cu Winston și error handling complet
- **API Documentation** cu Swagger/OpenAPI

### Database & Infrastructure
- **MongoDB** cu Mongoose ODM și validări avansate
- **Redis** pentru caching și session management  
- **Docker** multi-stage builds pentru optimizare
- **Nginx** reverse proxy cu SSL și security headers
- **Monitoring** și health checks integrate

## 🛠️ Tech Stack

### Frontend
- **React 18** cu TypeScript
- **Tailwind CSS** pentru styling
- **React Router 6** pentru routing
- **React Query** pentru server state
- **React Hook Form** + **Zod** pentru formulare
- **Headless UI** pentru componente accesibile
- **React Hot Toast** pentru notificări

### Backend
- **Node.js** + **Express.js**
- **TypeScript** pentru type safety
- **MongoDB** cu **Mongoose**
- **Redis** pentru caching
- **JWT** pentru autentificare
- **Bcrypt** pentru hash-uirea parolelor
- **Joi** pentru validări
- **Winston** pentru logging
- **Nodemailer** pentru email-uri

### DevOps & Tools
- **Docker** + **Docker Compose**
- **Nginx** pentru reverse proxy
- **Jest** + **Supertest** pentru backend testing
- **Vitest** + **React Testing Library** pentru frontend testing
- **ESLint** + **Prettier** pentru code quality
- **Cloudinary** pentru file storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### 1. Clone Repository
```bash
git clone https://github.com/matthew-devOP/MERN-v1-portofolio.git
cd MERN-v1-portofolio
```

### 2. Environment Setup
```bash
# Copiază și configurează variabilele de mediu
cp .env.example .env

# Editează .env cu valorile tale
```

### 3. Docker Development
```bash
# Start all services
chmod +x scripts/docker-dev.sh
./scripts/docker-dev.sh start

# View logs
./scripts/docker-dev.sh logs

# Check service status
./scripts/docker-dev.sh health
```

### 4. Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (în alt terminal)
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
MERN-v1-portofolio/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/            # Configurări (DB, JWT, etc.)
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── tests/            # Backend tests
│   │   ├── utils/            # Helper functions
│   │   └── app.js            # Express app setup
│   ├── Dockerfile            # Backend Docker config
│   └── package.json
├── frontend/                   # React + TypeScript
│   ├── src/
│   │   ├── api/              # API client functions
│   │   ├── components/       # React components
│   │   ├── context/          # React Context
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Page components
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Helper functions
│   ├── Dockerfile            # Frontend Docker config
│   └── package.json
├── nginx/                      # Nginx configuration
├── scripts/                    # Development scripts
├── docker-compose.yml          # Production setup
├── docker-compose.dev.yml      # Development setup
└── README.md
```

## 🧪 Testing

### Backend Tests
```bash
# Run all backend tests
./scripts/docker-dev.sh test backend

# Local testing
cd backend
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Frontend Tests  
```bash
# Run all frontend tests
./scripts/docker-dev.sh test frontend

# Local testing
cd frontend
npm test

# UI mode
npm run test:ui

# Coverage
npm run test:coverage
```

### Test Coverage
- **Backend**: Authentication, Posts, Comments API
- **Frontend**: Components, Forms, User Interactions
- **E2E**: Critical user flows (planned)

## 🚀 Deployment

### Production with Docker
```bash
# Build and start production services
docker-compose up -d

# Check logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3
```

### Environment Variables
```bash
# Database
MONGO_URI=mongodb://localhost:27017/blog_platform
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend
VITE_API_URL=http://localhost:5000/api
```

## 📚 API Documentation

API-ul este documentat complet cu Swagger/OpenAPI:
- **Development**: http://localhost:5000/api/docs
- **Production**: https://your-domain.com/api/docs

### Main Endpoints
```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
POST   /api/auth/refresh      # Refresh tokens
GET    /api/auth/me           # Current user
POST   /api/auth/logout       # Logout

GET    /api/posts             # Get all posts
POST   /api/posts             # Create post
GET    /api/posts/:id         # Get single post
PUT    /api/posts/:id         # Update post
DELETE /api/posts/:id         # Delete post

GET    /api/posts/:id/comments # Get comments
POST   /api/posts/:id/comments # Create comment
PUT    /api/comments/:id       # Update comment
DELETE /api/comments/:id       # Delete comment

GET    /api/users/profile      # User profile
PUT    /api/users/profile      # Update profile
POST   /api/upload            # File upload
```

## 🔧 Development Scripts

### Docker Management
```bash
# Start services
./scripts/docker-dev.sh start

# Stop services  
./scripts/docker-dev.sh stop

# Restart services
./scripts/docker-dev.sh restart

# View logs
./scripts/docker-dev.sh logs [service]

# Check health
./scripts/docker-dev.sh health

# Seed database
./scripts/docker-dev.sh seed

# Run tests
./scripts/docker-dev.sh test [backend|frontend]

# Clean up
./scripts/docker-dev.sh cleanup

# Open shell
./scripts/docker-dev.sh shell [service]
```

### Backend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run test:watch   # Watch mode
npm run lint         # ESLint check
npm run lint:fix     # Fix ESLint issues
npm run seed         # Seed database
```

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run test:ui      # Vitest UI
npm run lint         # ESLint check
npm run type-check   # TypeScript check
```

## 🛡️ Security Features

- **JWT Authentication** cu refresh token rotation
- **Password hashing** cu bcrypt (12 rounds)
- **Rate limiting** pentru API endpoints
- **CORS** configurat corespunzător
- **Helmet** pentru security headers
- **Input sanitization** și validare
- **SQL/NoSQL injection** protection
- **XSS protection** cu CSP headers
- **HTTPS** ready cu SSL/TLS

## 🎯 Performance Optimizations

- **Redis caching** pentru database queries
- **Image optimization** cu Cloudinary
- **Code splitting** în frontend
- **Lazy loading** pentru componente
- **Bundle optimization** cu Vite
- **Docker multi-stage builds**
- **Nginx gzip compression**
- **Database indexing** optimizat

## 🔄 CI/CD Pipeline (Planned)

- **GitHub Actions** pentru automated testing
- **Docker Registry** pentru image storage
- **Automated deployments** to cloud providers
- **Security scanning** cu vulnerability checks
- **Performance monitoring** cu analytics

## 🤝 Contributing

1. Fork repository-ul
2. Creează o branch pentru feature (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Deschide un Pull Request

### Development Guidelines
- Folosește **TypeScript** pentru type safety
- Scrie **teste** pentru new features
- Urmează **ESLint** și **Prettier** configs
- Documentează **API endpoints** în Swagger
- Folosește **conventional commits**

## 📋 Roadmap

### Phase 1 - Core Features ✅
- [x] Authentication system
- [x] Blog CRUD operations
- [x] Comment system
- [x] User management
- [x] Docker setup

### Phase 2 - Advanced Features 🔄
- [ ] Real-time notifications
- [ ] Advanced search & filtering
- [ ] Social features (likes, shares)
- [ ] Email notifications
- [ ] Admin dashboard

### Phase 3 - Performance & Scale 📅
- [ ] GraphQL API
- [ ] Microservices architecture
- [ ] CDN integration
- [ ] Advanced caching strategies
- [ ] Monitoring & analytics

## 🐛 Known Issues

- Tests require proper Docker environment setup
- Email notifications need SMTP configuration
- File uploads limited to 10MB (configurable)

## 📄 License

Acest proiect este licențiat sub MIT License - vezi [LICENSE](LICENSE) pentru detalii.

## 👤 Author

**Matthew Dev**
- GitHub: [@matthew-devOP](https://github.com/matthew-devOP)
- Project Link: [MERN-v1-portofolio](https://github.com/matthew-devOP/MERN-v1-portofolio)

## 🙏 Acknowledgments

- React community pentru ecosistemul fantastic
- MongoDB pentru documentația excelentă
- Docker pentru containerization tools
- Toate open-source libraries folosite în proiect

---

⭐ **Star acest repository dacă ți-a fost util!**

🤖 **Generated with [Claude Code](https://claude.ai/code)**