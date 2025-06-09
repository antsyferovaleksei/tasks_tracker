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
import { useTranslation } from 'react-i18next';
import { useTheme as useAppTheme, useDeviceDetection } from '../hooks';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import LanguageToggle from '../components/LanguageToggle';

export default function RegisterPage() {
  const { t } = useTranslation();
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
  const { signUp, loading: authLoading } = useSupabaseAuth();
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
      newErrors.name = t('validation.required');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('validation.minLength').replace('{min}', '2');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('validation.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.email');
    }

    if (!formData.password) {
      newErrors.password = t('validation.required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('validation.minLength').replace('{min}', '6');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMismatch');
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
      const result = await signUp(
        formData.email.trim(),
        formData.password,
        { name: formData.name.trim() }
      );
      
      console.log('Успішна реєстрація:', result);
      
      if (result.user) {
        // Користувач зареєстрований та підтверджений
        setSuccessMessage(t('auth.registerSuccess'));
        setTimeout(() => navigate('/tasks'), 2000);
      } else {
        // Потрібне підтвердження email
        setSuccessMessage(t('auth.checkEmail'));
      }
    } catch (error: any) {
      console.error('Помилка реєстрації:', error);
      setRegisterError(error.message || t('auth.registerError'));
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
                    {t('home.title')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <LanguageToggle />
                  <IconButton onClick={toggleTheme} size="small">
                    {currentTheme === 'light' ? <DarkMode /> : <LightMode />}
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="h4" component="h2" gutterBottom fontWeight="600">
                {t('auth.welcome')} 🚀
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('auth.createAccount')}
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
                label={t('auth.name')}
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
                label={t('auth.email')}
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
                label={t('auth.password')}
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
                label={t('auth.confirmPassword')}
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
                    {t('auth.register')}
                  </>
                ) : (
                  t('auth.register')
                )}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('auth.or')}
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('auth.alreadyHaveAccount')}
                  {' '}
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
                    {t('auth.login')}
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