import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  TaskAlt,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTheme as useAppTheme, useDeviceDetection } from '../hooks';
import { authService } from '../api/supabase-auth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const theme = useTheme();
  const { currentTheme, setTheme } = useAppTheme();
  const { isMobile } = useDeviceDetection();
  const navigate = useNavigate();

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    if (registerError) {
      setRegisterError('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = "Ім'я обов'язкове";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Ім'я повинно містити мінімум 2 символи";
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обов\'язковий';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Невірний формат email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обов\'язковий';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль повинен містити мінімум 6 символів';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Підтвердження паролю обов\'язкове';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Паролі не співпадають';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setRegisterError('');
    setSuccessMessage('');

    try {
      const result = await authService.signUp(
        formData.email.trim(),
        formData.password,
        { name: formData.name.trim() }
      );
      
      console.log('Успішна реєстрація:', result);
      
      if (result.user) {
        // Користувач зареєстрований та підтверджений
        localStorage.setItem('supabase-user', JSON.stringify(result.user));
        setSuccessMessage('Реєстрація успішна! Перенаправляємо...');
        setTimeout(() => navigate('/tasks'), 2000);
      } else {
        // Потрібне підтвердження email
        setSuccessMessage('Реєстрація успішна! Перевірте email для підтвердження акаунту.');
      }
    } catch (error: any) {
      console.error('Помилка реєстрації:', error);
      setRegisterError(error.message || 'Помилка реєстрації. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={24}
            sx={{
              p: isMobile ? 3 : 4,
              borderRadius: 3,
              background: theme.palette.background.paper,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TaskAlt sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Typography variant="h5" component="h1" fontWeight="bold">
                    Tasks Tracker
                  </Typography>
                </Box>
                <IconButton onClick={toggleTheme} size="small">
                  {currentTheme === 'light' ? <DarkMode /> : <LightMode />}
                </IconButton>
              </Box>
              <Typography variant="h4" component="h2" gutterBottom fontWeight="600">
                Вітаємо! 🚀
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Створіть акаунт для початку роботи
              </Typography>
            </Box>

            {/* Error/Success Alerts */}
            {registerError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {registerError}
              </Alert>
            )}
            
            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
              </Alert>
            )}

            {/* Registration Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                id="name"
                label="Повне ім'я"
                name="name"
                autoComplete="name"
                autoFocus
                value={formData.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                id="email"
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                id="password"
                label="Пароль"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange('password')}
                error={!!errors.password}
                helperText={errors.password}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                id="confirmPassword"
                label="Підтвердити пароль"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  mb: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Реєстрація...
                  </>
                ) : (
                  'Зареєструватися'
                )}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  або
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Вже маєте акаунт?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    sx={{
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Увійти
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
} 