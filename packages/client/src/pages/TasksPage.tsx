import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks';
import { Task, TaskStatus, TaskPriority, TaskFilters } from '../types';
import { formatDate, getTaskStatusColor, getTaskPriorityColor } from '../utils';

export default function TasksPage() {
  const [filter, setFilter] = useState<TaskFilters>({
    status: undefined,
    priority: undefined,
    search: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as TaskPriority,
    status: 'TODO' as TaskStatus,
    archived: false,
  });

  const { tasks = [], isLoading } = useTasks(filter);
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const handleCreateTask = () => {
    createTaskMutation.mutate(newTask, {
      onSuccess: () => {
        setDialogOpen(false);
        setNewTask({
          title: '',
          description: '',
          priority: 'MEDIUM' as TaskPriority,
          status: 'TODO' as TaskStatus,
          archived: false,
        });
      },
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      archived: task.archived,
    });
    setDialogOpen(true);
  };

  const handleUpdateTask = () => {
    if (editingTask) {
      updateTaskMutation.mutate(
        { id: editingTask.id, data: newTask },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingTask(null);
            setNewTask({
              title: '',
              description: '',
              priority: 'MEDIUM' as TaskPriority,
              status: 'TODO' as TaskStatus,
              archived: false,
            });
          },
        }
      );
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Ви впевнені, що хочете видалити це завдання?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>Завантаження...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Завдання
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Додати завдання
        </Button>
      </Box>

      {/* Filters */}
      <Box mb={3} display="flex" gap={2}>
        <TextField
          placeholder="Пошук завдань..."
          value={filter.search || ''}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          sx={{ minWidth: 200 }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Статус</InputLabel>
          <Select
            value={filter.status || ''}
            onChange={(e) => setFilter({ ...filter, status: e.target.value as TaskStatus || undefined })}
          >
            <MenuItem value="">Всі</MenuItem>
            <MenuItem value="TODO">Потрібно зробити</MenuItem>
            <MenuItem value="IN_PROGRESS">В процесі</MenuItem>
            <MenuItem value="COMPLETED">Завершено</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Пріоритет</InputLabel>
          <Select
            value={filter.priority || ''}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value as TaskPriority || undefined })}
          >
            <MenuItem value="">Всі</MenuItem>
            <MenuItem value="LOW">Низький</MenuItem>
            <MenuItem value="MEDIUM">Середній</MenuItem>
            <MenuItem value="HIGH">Високий</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tasks Grid */}
      <Grid container spacing={2}>
        {tasks.map((task: Task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h3">
                    {task.title}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleEditTask(task)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTask(task.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                {task.description && (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {task.description}
                  </Typography>
                )}

                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={task.status}
                    size="small"
                    color={getTaskStatusColor(task.status) as any}
                  />
                  <Chip
                    label={task.priority}
                    size="small"
                    color={getTaskPriorityColor(task.priority) as any}
                  />
                </Box>

                {task.createdAt && (
                  <Typography variant="caption" color="text.secondary">
                    Створено: {formatDate(task.createdAt)}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {tasks.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            Завдання не знайдено
          </Typography>
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Редагувати завдання' : 'Створити завдання'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Назва"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Опис"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Пріоритет</InputLabel>
              <Select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
              >
                <MenuItem value="LOW">Низький</MenuItem>
                <MenuItem value="MEDIUM">Середній</MenuItem>
                <MenuItem value="HIGH">Високий</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as TaskStatus })}
              >
                <MenuItem value="TODO">Потрібно зробити</MenuItem>
                <MenuItem value="IN_PROGRESS">В процесі</MenuItem>
                <MenuItem value="COMPLETED">Завершено</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Скасувати</Button>
          <Button
            onClick={editingTask ? handleUpdateTask : handleCreateTask}
            variant="contained"
            disabled={!newTask.title}
          >
            {editingTask ? 'Оновити' : 'Створити'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 