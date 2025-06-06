import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock project data
  const project = {
    id: id || '1',
    name: 'Проект ' + (id || '1'),
    description: 'Опис проекту для демонстрації функціональності',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasksCount: 5,
    completedTasks: 2,
  };

  const isLoading = false;
  const error = null;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Проект не знайдено або сталася помилка завантаження
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
          Повернутися до проектів
        </Button>
      </Box>
    );
  }

  const completionRate = project.tasksCount > 0 
    ? Math.round((project.completedTasks / project.tasksCount) * 100) 
    : 0;

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/projects')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {project.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                  <Typography variant="h5" mb={2}>
                    {project.name}
                  </Typography>
                  <Chip
                    label={project.status}
                    color={project.status === 'ACTIVE' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Box>
                  <IconButton>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              {project.description && (
                <Box mb={3}>
                  <Typography variant="h6" mb={1}>
                    Опис
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {project.description}
                  </Typography>
                </Box>
              )}

              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Створено:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(project.createdAt).toLocaleDateString('uk-UA')}
                  </Typography>
                </Box>
                
                {project.updatedAt && project.updatedAt !== project.createdAt && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Оновлено:
                    </Typography>
                    <Typography variant="body2">
                      {new Date(project.updatedAt).toLocaleDateString('uk-UA')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Статистика проекту
              </Typography>
              
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TaskIcon color="primary" />
                <Typography variant="body2">
                  Завдань: {project.tasksCount}
                </Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Виконано: {project.completedTasks} з {project.tasksCount}
                </Typography>
                <Typography variant="h6" color="primary">
                  {completionRate}% завершено
                </Typography>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<TaskIcon />}
                onClick={() => navigate(`/projects/${project.id}/tasks`)}
                sx={{ mt: 2 }}
              >
                Переглянути завдання
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 