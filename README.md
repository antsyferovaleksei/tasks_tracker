# Tasks Tracker

A modern, full-stack task management application built with React, TypeScript, Node.js, and PostgreSQL. Features real-time collaboration, time tracking, analytics, and project management capabilities.

## 🚀 Features

- **Task Management**: Create, edit, delete, and organize tasks with priorities and statuses
- **Time Tracking**: Start/stop timers for tasks with automatic completion on timer stop
- **Project Organization**: Group tasks by projects with color coding
- **Analytics Dashboard**: View productivity metrics, time spent, and task completion rates
- **User Authentication**: Secure JWT-based authentication with refresh tokens
- **Real-time Updates**: Live updates using React Query
- **Responsive Design**: Mobile-friendly Material-UI interface
- **Data Export**: Export reports to PDF and Excel formats
- **Advanced Filtering**: Filter tasks by status, priority, project, and tags

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for components and theming
- **React Query** for state management and caching
- **React Router** for navigation
- **Zustand** for local state management
- **Recharts** for data visualization
- **Vite** for build tooling

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL database
- **JWT** for authentication
- **Zod** for data validation
- **Node-cron** for scheduled tasks
- **ExcelJS & PDFKit** for report generation

### DevOps
- **Docker** and Docker Compose for containerization
- **ESLint** and Prettier for code quality
- **Concurrently** for running multiple processes

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **PostgreSQL** (v13 or higher)
- **Docker** and **Docker Compose** (optional, for containerized setup)

## 🚀 Quick Start

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tasks_tracker
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

### Option 2: Manual Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd tasks_tracker
   npm install
   ```

2. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb tasks_tracker
   
   # Or using psql
   psql -U postgres -c "CREATE DATABASE tasks_tracker;"
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/tasks_tracker?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
   JWT_REFRESH_EXPIRES_IN="30d"
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   cd packages/server
   npm run db:generate
   npm run db:push
   ```

5. **Start the development servers**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5001

## 📁 Project Structure

```
tasks_tracker/
├── packages/
│   ├── client/                 # React frontend application
│   │   ├── public/            # Static assets
│   │   ├── src/
│   │   │   ├── api/           # API client functions
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── pages/         # Page components
│   │   │   ├── store/         # State management
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   └── utils/         # Utility functions
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── server/                # Node.js backend application
│   │   ├── prisma/           # Database schema and migrations
│   │   ├── src/
│   │   │   ├── config/       # Configuration files
│   │   │   ├── controllers/  # Route controllers
│   │   │   ├── middleware/   # Express middleware
│   │   │   ├── routes/       # API routes
│   │   │   ├── services/     # Business logic
│   │   │   ├── types/        # TypeScript types
│   │   │   └── utils/        # Utility functions
│   │   └── package.json
│   │
│   └── shared/               # Shared utilities and types
│       └── src/
│           ├── types/        # Shared TypeScript types
│           └── validation.ts # Zod validation schemas
│
├── docker/                   # Docker configuration files
├── docs/                     # Documentation
├── docker-compose.yml        # Docker Compose configuration
├── package.json             # Root package.json (workspace)
└── README.md               # This file
```

## 🔧 Development

### Available Scripts

From the root directory:

```bash
# Start development servers (client + server)
npm run dev

# Start only client
npm run dev:client

# Start only server
npm run dev:server

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

### Database Management

```bash
cd packages/server

# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Code Quality

The project includes:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** strict mode for type safety
- Pre-commit hooks for code quality

## 🌐 API Documentation

The backend API provides the following endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile

### Tasks
- `GET /api/tasks` - Get tasks with pagination and filtering
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Time Tracking
- `POST /api/time-entries/start` - Start time tracking
- `PUT /api/time-entries/:id/stop` - Stop time tracking
- `GET /api/time-entries/active` - Get active timer
- `GET /api/time-entries/tasks/:taskId/stats` - Get task time statistics

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard metrics
- `GET /api/analytics/reports` - Generate reports
- `GET /api/analytics/export` - Export data

## 🔒 Environment Variables

### Required Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `30d` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `CLIENT_URL` | Frontend URL | `http://localhost:3000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | Email server host | - |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email username | - |
| `SMTP_PASS` | Email password | - |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## 🚢 Deployment

### Docker Deployment

1. **Build and deploy with Docker Compose**
   ```bash
   # Production build
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Environment setup**
   - Copy `env.example` to `.env.production`
   - Update all secrets and URLs for production
   - Ensure database is accessible

### Manual Deployment

1. **Build the applications**
   ```bash
   npm run build
   ```

2. **Set up production database**
   ```bash
   cd packages/server
   npm run db:migrate
   ```

3. **Start production server**
   ```bash
   cd packages/server
   npm start
   ```

4. **Serve frontend**
   - Deploy the `packages/client/dist` folder to a web server
   - Configure reverse proxy to backend API

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests for specific package
npm run test --workspace=server
npm run test --workspace=client

# Run tests in watch mode
npm run test:watch
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use conventional commit messages
- Add tests for new features
- Update documentation for API changes
- Follow the existing code style

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 5001
   lsof -ti:5001 | xargs kill -9
   
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database connection issues**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env
   - Ensure database exists

3. **Build errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules packages/*/node_modules
   npm install
   ```

4. **Prisma issues**
   ```bash
   # Reset Prisma client
   cd packages/server
   npm run db:generate
   ```

## 🔄 Updates

To update the application:

1. Pull latest changes: `git pull origin main`
2. Install dependencies: `npm install`
3. Run migrations: `cd packages/server && npm run db:migrate`
4. Restart development servers: `npm run dev`

---
