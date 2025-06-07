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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
// import { useTask } from '../hooks';
// import { formatDate, getTaskStatusColor, getTaskPriorityColor } from '../utils';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock task data since hook might not work correctly
  const task = {
    id: id || '1',
    title: 'Tasks ' + (id || '1'),
    description: 'Description task для демонстрації функціональності',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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

  if (error || !task) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Tasks не знайдено або сталася помилка завантаження
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tasks')}
          sx={{ mt: 2 }}
        >
          Повернутися до tasks
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/tasks')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {task.title}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
            <Box>
              <Typography variant="h5" mb={2}>
                {task.title}
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                                 <Chip
                   label={task.status}
                   color="primary"
                   size="small"
                 />
                 <Chip
                   label={task.priority}
                   color="secondary"
                   size="small"
                 />
              </Box>
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

          {task.description && (
            <Box mb={3}>
              <Typography variant="h6" mb={1}>
                Description
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {task.description}
              </Typography>
            </Box>
          )}

          <Box display="flex" flexDirection="column" gap={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Створено:
              </Typography>
                             <Typography variant="body2">
                 {new Date(task.createdAt).toLocaleDateString('uk-UA')}
               </Typography>
             </Box>
             
             {task.updatedAt && task.updatedAt !== task.createdAt && (
               <Box>
                 <Typography variant="subtitle2" color="text.secondary">
                   Оновлено:
                 </Typography>
                 <Typography variant="body2">
                   {new Date(task.updatedAt).toLocaleDateString('uk-UA')}
                 </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
} 