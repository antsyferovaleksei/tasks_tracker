import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import apiClient from '../api/client';
import { authService } from '../api/supabase-auth';
import { projectsService } from '../api/supabase-data';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, signOut } = useSupabaseAuth();
  const [loginData, setLoginData] = useState({
    email: 'user@gmail.com',
    password: 'password123456'
  });
  const [registerData, setRegisterData] = useState({
    email: 'newuser@gmail.com',
    password: 'password123456',
    name: 'Новий Користувач'
  });
  const [projectData, setProjectData] = useState({
    name: 'Test Project з UI',
    description: 'Project description created with UI',
    color: '#2196f3',
    archived: false
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [healthStatus, setHealthStatus] = useState<string>('');

  const handleHealthCheck = async () => {
    setLoading(true);
    setError('');
    setHealthStatus('');
    try {
      const response = await apiClient.healthCheck();
      setHealthStatus(`✅ API працює! ${response.timestamp}`);
      setSuccess('Health check пройшов успішно!');
    } catch (err: any) {
      console.error('Health check error:', err);
      setHealthStatus('❌ API недоступний (очікувано на Vercel)');
      setError('Кастомні API endpoints не працюють на Vercel Free tier. Використовуйте Supabase Auth нижче!');
    } finally {
      setLoading(false);
    }
  };

  const handleSupabaseRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await authService.signUp(
        registerData.email, 
        registerData.password, 
        { name: registerData.name }
      );
      
      if (result.user) {
        setSuccess(`✅ Реєстрація успішна! Користувач: ${result.user.email}. Тепер можете увійти з тими ж даними.`);
        // Автоматично копіюємо дані для входу
        setLoginData({
          email: registerData.email,
          password: registerData.password
        });
      } else {
        setSuccess('✅ Реєстрація відправлена! Перевірте email для підтвердження акаунту.');
      }
      
      console.log('Supabase registration result:', result);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError('Помилка реєстрації: ' + (err.message || 'Невідома помилка'));
    } finally {
      setLoading(false);
    }
  };

  const handleSupabaseLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await authService.signIn(loginData.email, loginData.password);
      setIsLoggedIn(true);
      setSuccess(`✅ Вхід успішний! Вітаємо, ${result.user?.email}!`);
      console.log('Supabase login result:', result);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message.includes('Email not confirmed')) {
        setError('📧 Email не підтверджений. Перевірте пошту або вимкніть підтвердження email в Supabase Dashboard → Auth → Settings.');
      } else if (err.message.includes('Invalid login credentials')) {
        setError('❌ Невірні дані для входу. Спочатку зареєструйтеся або перевірте email/пароль.');
      } else {
        setError('Помилка входу: ' + (err.message || 'Невідома помилка'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.login(loginData);
      if (response.success && response.data) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        setIsLoggedIn(true);
        setSuccess('Success login!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    setLoading(true);
    setError('');
    try {
      const project = await projectsService.createProject({
        name: projectData.name,
        description: projectData.description,
        color: projectData.color,
        archived: projectData.archived
      });
      setSuccess(`✅ Проект "${project.name}" створено успішно!`);
      loadProjects();
    } catch (err: any) {
      console.error('Project creation error:', err);
      setError('Помилка створення проекту: ' + (err.message || 'Невідома помилка'));
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const projects = await projectsService.getProjects();
      setProjects(projects);
      setSuccess(`✅ Завантажено ${projects.length} проектів`);
    } catch (err: any) {
      console.error('Projects loading error:', err);
      setError('Помилка завантаження проектів: ' + (err.message || 'Невідома помилка'));
    }
  };

  return (
    <Box p={3} maxWidth={800} mx="auto">
      <Typography variant="h4" mb={3}>
        Тестова сторінка API
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Поточний користувач:</strong> {user ? user.email : 'Не авторизований'}
        {user && (
          <Button 
            size="small" 
            onClick={signOut} 
            sx={{ ml: 2 }}
            variant="outlined"
          >
            Вийти
          </Button>
        )}
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            0. Health Check API
          </Typography>
          <Button
            variant="outlined"
            onClick={handleHealthCheck}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ mb: 2 }}
          >
            {loading ? 'Перевіряю...' : 'Перевірити API'}
          </Button>
          {healthStatus && (
            <Typography 
              variant="body2" 
              color={healthStatus.includes('✅') ? 'success.main' : 'warning.main'}
              sx={{ mt: 1, fontWeight: 'bold' }}
            >
              {healthStatus}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2} color="primary">
            🚀 Supabase Auth (Рекомендовано)
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Спочатку зареєструйте нового користувача, потім увійдіть з тими ж даними.
          </Alert>
          
          <Typography variant="subtitle2" gutterBottom>
            Реєстрація нового користувача
          </Typography>
          <Box display="flex" flexDirection="column" gap={2} mb={3}>
            <TextField
              label="Email"
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
            />
            <TextField
              label="Пароль"
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
            />
            <TextField
              label="Ім'я"
              value={registerData.name}
              onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
            />
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSupabaseRegister}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Реєструю...' : 'Зареєструватися через Supabase'}
            </Button>
            
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => setLoginData({
                email: registerData.email,
                password: registerData.password
              })}
              sx={{ ml: 1 }}
            >
              📋 Копіювати дані для входу
            </Button>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Вхід в систему
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Email"
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
            />
            <TextField
              label="Пароль"
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
            />
            <Button 
              variant="contained"
              color="secondary"
              onClick={handleSupabaseLogin}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Входжу...' : 'Увійти через Supabase'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {!isLoggedIn ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              1. Вхід в систему
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
              <TextField
                label="Password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
              <Button
                variant="contained"
                onClick={handleLogin}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Login...' : 'Login'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>
                2. Create project
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Project name"
                  value={projectData.name}
                  onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                />
                <TextField
                  label="Description"
                  value={projectData.description}
                  onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  multiline
                  rows={3}
                />
                <TextField
                  label="Color"
                  type="color"
                  value={projectData.color}
                  onChange={(e) => setProjectData({ ...projectData, color: e.target.value })}
                />
                <Button
                  variant="contained"
                  onClick={handleCreateProject}
                  disabled={loading || !projectData.name}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Creating...' : 'Create project'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                3. Існуючі projectи
              </Typography>
              <Button onClick={loadProjects} variant="outlined" sx={{ mb: 2 }}>
                Оновити список
              </Button>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <Box key={project.id} p={2} border="1px solid #ddd" borderRadius={1} mb={1}>
                    <Typography variant="subtitle1">{project.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.description}
                    </Typography>
                    <Typography variant="caption">
                      Створено: {new Date(project.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">Projects не знайдено</Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
} 