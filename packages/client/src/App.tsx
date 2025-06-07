import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, GlobalStyles } from '@mui/material';
import { Toaster } from 'react-hot-toast';

import { useAuth, useTheme, useDeviceDetection } from './hooks';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const Layout = lazy(() => import('./components/Layout'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const TaskDetailPage = lazy(() => import('./pages/TaskDetailPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const TestPage = lazy(() => import('./pages/TestPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LoadingSpinner = lazy(() => import('./components/LoadingSpinner'));
const ErrorBoundary = lazy(() => import('./components/ErrorBoundary'));


// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 401, 403, 404
        if (error?.response?.status && [401, 403, 404].includes(error.response.status)) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/tasks" replace />;
  }
  
  return <>{children}</>;
};

// App component
const App: React.FC = () => {
  const { currentTheme } = useTheme();
  useDeviceDetection(); // Initialize device detection
  
  // Create MUI theme
  const theme = createTheme({
    palette: {
      mode: currentTheme as 'light' | 'dark',
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
      },
      secondary: {
        main: '#dc004e',
        light: '#ff5983',
        dark: '#9a0036',
      },
      background: {
        default: currentTheme === 'dark' ? '#121212' : '#f5f5f5',
        paper: currentTheme === 'dark' ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: currentTheme === 'dark' ? '#ffffff' : '#333333',
        secondary: currentTheme === 'dark' ? '#aaaaaa' : '#666666',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.43,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
            padding: '8px 16px',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: currentTheme === 'dark' 
              ? '0 1px 3px rgba(255,255,255,0.05)' 
              : '0 1px 3px rgba(0,0,0,0.12)',
            borderRadius: 12,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  });

  // Global styles
  const globalStyles = (
    <GlobalStyles
      styles={(theme) => ({
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          MozOsxFontSmoothing: 'grayscale',
          WebkitFontSmoothing: 'antialiased',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          width: '100%',
        },
        body: {
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          minHeight: '100%',
          width: '100%',
          margin: 0,
          padding: 0,
          fontFamily: theme.typography.fontFamily,
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        },
        '#root': {
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
        },
        '.recharts-text': {
          fill: theme.palette.text.primary,
        },
        // Scrollbar styles
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: theme.palette.action.hover,
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb': {
          background: theme.palette.action.disabled,
          borderRadius: '4px',
          '&:hover': {
            background: theme.palette.action.selected,
          },
        },
        // Focus styles
        '*:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
        },
        // Animation classes
        '.fade-in': {
          animation: 'fadeIn 0.3s ease-in',
        },
        '.slide-up': {
          animation: 'slideUp 0.3s ease-out',
        },
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        '@keyframes slideUp': {
          from: { 
            opacity: 0,
            transform: 'translateY(20px)',
          },
          to: { 
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      })}
    />
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {globalStyles}
        <ErrorBoundary>
          <Router>
            <div className="App">
              <Routes>
                {/* Public routes */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <LoginPage />
                      </Suspense>
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <RegisterPage />
                      </Suspense>
                    </PublicRoute>
                  }
                />
                <Route
                  path="/test"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <TestPage />
                    </Suspense>
                  }
                />

                {/* Protected routes with layout */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner />}>
                          <Routes>
                            <Route path="/" element={<Navigate to="/tasks" replace />} />
                            <Route path="/tasks" element={<TasksPage />} />
                            <Route path="/tasks/:id" element={<TaskDetailPage />} />
                            <Route path="/projects" element={<ProjectsPage />} />
                            <Route path="/projects/:id" element={<ProjectDetailPage />} />
                            <Route path="/analytics" element={<AnalyticsPage />} />
      
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="*" element={<NotFoundPage />} />
                          </Routes>
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </ErrorBoundary>

        {/* Toast notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              boxShadow: theme.shadows[4],
            },
            success: {
              iconTheme: {
                primary: theme.palette.success.main,
                secondary: theme.palette.success.contrastText,
              },
            },
            error: {
              iconTheme: {
                primary: theme.palette.error.main,
                secondary: theme.palette.error.contrastText,
              },
            },
          }}
        />


      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App; 