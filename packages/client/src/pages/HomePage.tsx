import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
  IconButton,
  Chip,
} from '@mui/material';
import {
  TaskAlt,
  Assignment,
  Analytics,
  Folder,
  Timeline,
  Speed,
  Security,
  LightMode,
  DarkMode,
  ArrowForward,
  Dashboard,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme as useAppTheme } from '../hooks';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentTheme, setTheme } = useAppTheme();
  const { user, signOut } = useSupabaseAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Assignment,
      title: 'Управління завданнями',
      description: 'Створюйте, організовуйте та відслідковуйте ваші завдання',
      color: theme.palette.primary.main,
    },
    {
      icon: Folder,
      title: 'Проекти',
      description: 'Групуйте завдання за проектами та категоріями',
      color: theme.palette.success.main,
    },
    {
      icon: Analytics,
      title: 'Аналітика',
      description: 'Отримуйте звіти про продуктивність та прогрес',
      color: theme.palette.warning.main,
    },
    {
      icon: Timeline,
      title: 'Трекінг часу',
      description: 'Відслідковуйте час, витрачений на завдання',
      color: theme.palette.secondary.main,
    },
    {
      icon: Speed,
      title: 'Швидка робота',
      description: 'Оптимізований інтерфейс для максимальної ефективності',
      color: theme.palette.info.main,
    },
    {
      icon: Security,
      title: 'Безпека',
      description: 'Ваші дані захищені сучасними методами шифрування',
      color: theme.palette.error.main,
    },
  ];

  const toggleTheme = () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: currentTheme === 'dark' 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          zIndex: 100,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TaskAlt sx={{ fontSize: 32, color: 'white' }} />
              <Typography variant="h5" component="h1" fontWeight="bold" color="white">
                Tasks Tracker
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {user && (
                <Chip
                  label={user.email}
                  variant="outlined"
                  sx={{ color: 'white', borderColor: 'white' }}
                />
              )}
              <IconButton onClick={toggleTheme} sx={{ color: 'white' }}>
                {currentTheme === 'light' ? <DarkMode /> : <LightMode />}
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                color: 'white',
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              Керуйте завданнями{' '}
              <Box component="span" sx={{ color: theme.palette.primary.light }}>
                ефективно
              </Box>
            </Typography>
            
            <Typography
              variant="h5"
              color="rgba(255,255,255,0.8)"
              sx={{ mb: 4, fontSize: { xs: '1.2rem', md: '1.5rem' } }}
            >
              Сучасний інструмент для планування, відслідковування та аналізу ваших завдань
            </Typography>

            {user ? (
              // Authenticated user actions
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Dashboard />}
                  onClick={() => navigate('/tasks')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    }
                  }}
                >
                  Перейти до завдань
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={signOut}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  Вийти
                </Button>
              </Box>
            ) : (
              // Unauthenticated user actions
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/login')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    }
                  }}
                >
                  Увійти
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  Реєстрація
                </Button>
              </Box>
            )}
          </Box>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'white',
              mb: 6,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            Можливості системи
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid rgba(255,255,255,0.2)`,
                      borderRadius: 3,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <feature.icon
                          sx={{
                            fontSize: 40,
                            color: feature.color,
                            mr: 2,
                          }}
                        />
                        <Typography
                          variant="h6"
                          component="h3"
                          fontWeight="bold"
                          color="white"
                        >
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        color="rgba(255,255,255,0.8)"
                        lineHeight={1.6}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default HomePage; 