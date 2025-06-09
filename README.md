# Tasks Tracker

A modern, full-stack task management application built with React, TypeScript, Supabase, and PostgreSQL. Features real-time collaboration, time tracking, analytics, project management, and multi-language support.

## 🚀 Features

- **Task Management**: Create, edit, delete, and organize tasks with priorities and statuses
- **Time Tracking**: Start/stop timers for tasks with automatic time logging
- **Project Organization**: Group tasks by projects with customizable color coding
- **Analytics Dashboard**: View productivity metrics, time spent, and task completion rates with charts
- **Multi-language Support**: Full localization in Ukrainian and English with dynamic language switching
- **User Authentication**: Secure Supabase authentication with social login options
- **Real-time Updates**: Live updates using React Query and Supabase real-time subscriptions
- **Responsive Design**: Mobile-friendly Material-UI interface with dark/light theme support
- **Data Export**: Export analytics and reports to CSV format
- **Advanced Filtering**: Filter tasks by status, priority, project, and search
- **PWA Support**: Progressive Web App capabilities for offline use

## 🌐 Localization

The application supports multiple languages with complete UI translation:

- **Ukrainian (Default)**: Complete interface translation
- **English**: Full English localization
- **Dynamic Language Switching**: Change language without page reload
- **Persistent Settings**: Language preference saved in localStorage
- **Translated Content**: All UI elements, form validation, messages, and notifications

### Language Features
- Navigation menus and page titles
- Form labels and validation messages
- Task and project management interfaces
- Analytics charts and labels
- User profile and settings
- Authentication pages (login/register)
- Toast notifications and error messages
- Date and time formatting

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for components and theming
- **React Query (TanStack Query)** for state management and caching
- **React Router** for navigation
- **Zustand** for local state management
- **Recharts** for data visualization
- **React i18next** for internationalization
- **Framer Motion** for animations
- **React Hot Toast** for notifications
- **Vite** for build tooling and PWA support

### Backend & Database
- **Supabase** for backend-as-a-service
  - PostgreSQL database with real-time subscriptions
  - Built-in authentication and user management
  - Row Level Security (RLS) for data protection
  - Real-time APIs and webhooks
- **Supabase JavaScript Client** for data operations
- **TypeScript** for type safety throughout the stack

### DevOps & Deployment
- **Vercel** for frontend deployment with automatic CI/CD
- **Supabase Cloud** for managed database and backend services
- **Docker** support for local development
- **ESLint** and Prettier for code quality
- **PWA** configuration for mobile app-like experience

## 📋 Prerequisites

Before you begin, ensure you have the following:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Supabase Account** (free tier available at [supabase.com](https://supabase.com))

## 🚀 Quick Start

### Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the project to be fully provisioned
   - Navigate to Settings > API to get your keys

2. **Database Setup**
   - Go to the SQL Editor in your Supabase dashboard
   - Create the required tables by running the SQL schema (see `SUPABASE_SETUP.md`)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tasks_tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_APP_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   This will start the frontend at http://localhost:3000

## 📁 Project Structure

```
tasks_tracker/
├── packages/
│   ├── client/                 # React frontend application
│   │   ├── public/            # Static assets and PWA manifests
│   │   ├── src/
│   │   │   ├── api/           # Supabase client and API functions
│   │   │   ├── components/    # Reusable UI components
│   │   │   │   ├── LanguageToggle.tsx  # Language switcher
│   │   │   │   └── ...        # Other components
│   │   │   ├── contexts/      # React contexts
│   │   │   │   ├── SupabaseAuthContext.tsx  # Auth provider
│   │   │   │   └── ...        # Other contexts
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── i18n/          # Internationalization setup
│   │   │   ├── locales/       # Translation files
│   │   │   │   ├── ua.json    # Ukrainian translations
│   │   │   │   └── en.json    # English translations
│   │   │   ├── pages/         # Page components
│   │   │   │   ├── HomePage.tsx     # Landing page
│   │   │   │   ├── TasksPage.tsx    # Task management
│   │   │   │   ├── ProjectsPage.tsx # Project management
│   │   │   │   ├── AnalyticsPage.tsx# Analytics dashboard
│   │   │   │   ├── ProfilePage.tsx  # User profile
│   │   │   │   ├── LoginPage.tsx    # Authentication
│   │   │   │   └── RegisterPage.tsx # User registration
│   │   │   ├── store/         # Zustand state management
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   └── utils/         # Utility functions
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── server/                # Legacy Node.js backend (optional)
│   └── shared/               # Shared utilities and types
│
├── docker/                   # Docker configuration files
├── docs/                     # Documentation
│   ├── SUPABASE_SETUP.md    # Database schema setup
│   ├── VERCEL_DEPLOYMENT.md # Deployment instructions
│   └── ...                  # Other documentation
├── docker-compose.yml        # Docker Compose configuration
├── package.json             # Root package.json (workspace)
└── README.md               # This file
```

## 🔧 Development

### Available Scripts

From the root directory:

```bash
# Start development server (client only)
npm run dev

# Start only client
npm run dev:client

# Build for production
npm run build

# Build client only
npm run build:client

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

### Language Management

The application uses React i18next for internationalization:

```bash
# Translation files location
packages/client/src/locales/
├── ua.json    # Ukrainian (default)
└── en.json    # English
```

To add new translations:
1. Add the key-value pairs to both language files
2. Use the `useTranslation` hook in components:
   ```typescript
   import { useTranslation } from 'react-i18next';
   
   const { t } = useTranslation();
   const translatedText = t('your.translation.key');
   ```

### Code Quality

The project includes:
- **ESLint** for code linting with TypeScript rules
- **Prettier** for code formatting
- **TypeScript** strict mode for type safety
- **Vite** for fast development and optimized builds
- **PWA** configuration for offline support

## 🌐 Supabase Integration

The application uses Supabase for backend services:

### Database Tables
- **users** - User profiles and metadata
- **projects** - Project management with color coding
- **tasks** - Task management with status and priority
- **time_entries** - Time tracking entries with duration

### Authentication
- Email/password authentication
- User profile management
- Row Level Security (RLS) for data protection
- Real-time user presence

### Real-time Features
- Live task updates across sessions
- Real-time timer synchronization
- Collaborative project management

## 🔒 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |
| `VITE_APP_URL` | Application URL | `http://localhost:3000` |

### Development Setup

1. Create a `.env` file in the root directory
2. Copy variables from `env.example`
3. Replace with your Supabase project credentials
4. Restart the development server

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy to production
   vercel --prod
   ```

2. **Environment Variables**
   - Add environment variables in Vercel dashboard
   - Or use `vercel env` command to set them

3. **Automatic Deployments**
   - Connect your GitHub repository to Vercel
   - Every push to main branch triggers automatic deployment

### Manual Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy static files**
   - Upload `packages/client/dist` folder to your hosting provider
   - Configure environment variables on the hosting platform

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests for client
npm run test:client

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage
```

## 🌍 Internationalization (i18n)

### Supported Languages
- **Ukrainian (ua)** - Default language
- **English (en)** - Secondary language

### Translation Structure
```json
{
  "navigation": { ... },
  "dashboard": { ... },
  "tasks": { ... },
  "projects": { ... },
  "analytics": { ... },
  "profile": { ... },
  "auth": { ... },
  "common": { ... },
  "validation": { ... },
  "messages": { ... }
}
```

### Adding New Languages
1. Create new translation file in `packages/client/src/locales/`
2. Add language option to `LanguageToggle` component
3. Update i18n configuration in `packages/client/src/i18n/index.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use conventional commit messages
- Add translations for new UI elements
- Test in both Ukrainian and English
- Follow the existing code style and component patterns
- Update documentation for new features

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Issues**
   ```bash
   # Verify environment variables
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY
   
   # Check Supabase project status in dashboard
   ```

2. **Translation Missing**
   - Check browser console for missing translation keys
   - Verify translation exists in both `ua.json` and `en.json`
   - Restart development server after adding translations

3. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules packages/*/node_modules
   npm install
   
   # Clear Vite cache
   rm -rf packages/client/.vite
   ```

4. **Authentication Issues**
   - Verify Supabase authentication settings
   - Check user management policies in Supabase dashboard
   - Ensure RLS policies are correctly configured

## 🔄 Updates

To update the application:

1. Pull latest changes: `git pull origin main`
2. Install dependencies: `npm install`
3. Update database schema if needed (check `SUPABASE_SETUP.md`)
4. Restart development server: `npm run dev`

## 📖 Additional Documentation

- [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) - Database schema and setup instructions
- [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md) - Detailed deployment guide
- [`VERCEL_SECURITY_FIX.md`](./VERCEL_SECURITY_FIX.md) - Security configuration for Vercel

## 🎯 Production Deployment

Current production deployment: **https://tasks-tracker-client.vercel.app**

### Features in Production
- ✅ Multi-language support (Ukrainian/English)
- ✅ Real-time task management
- ✅ Time tracking with analytics
- ✅ Project organization
- ✅ User authentication
- ✅ PWA capabilities
- ✅ Responsive design
- ✅ Data export functionality

---

**Built with ❤️ using modern web technologies**
