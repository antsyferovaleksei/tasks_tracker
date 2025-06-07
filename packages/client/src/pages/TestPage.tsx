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

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loginData, setLoginData] = useState({
    email: 'admin@admin.com',
    password: 'admin123'
  });
  const [projectData, setProjectData] = useState({
    name: 'Test Project з UI',
    description: 'Project description створеного з UI',
    color: '#2196f3',
    archived: false
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.login(loginData);
      if (response.success && response.data) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        setIsLoggedIn(true);
        setSuccess('Успішний вхід!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Помилка входу');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.createProject(projectData);
      if (response.success) {
        setSuccess('Project створено успішно!');
        loadProjects();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating project');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await apiClient.getProjects();
      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Loading error projectів');
    }
  };

  return (
    <Box p={3} maxWidth={800} mx="auto">
      <Typography variant="h4" mb={3}>
        Тестова сторінка API
      </Typography>

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
                {loading ? 'Входження...' : 'Увійти'}
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
                  label="Колір"
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