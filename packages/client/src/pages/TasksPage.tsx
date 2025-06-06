import React, { useState, useMemo } from 'react';
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
  Alert,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormHelperText,
  Tooltip,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  AccessTime as TimeIcon,
  Timer as TimerIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  useTasks, 
  useCreateTask, 
  useUpdateTask, 
  useDeleteTask, 
  useProjects,
  useActiveTimer,
  useStartTimer,
  useStopTimer,
  useTimeStats,
  useCreateTimeEntry
} from '../hooks';
import { Task, TaskStatus, TaskPriority, TaskFilters, Project, TimeEntry } from '../types';
import { formatDate, getTaskStatusColor, getTaskPriorityColor } from '../utils';

// Функція для форматування часу в секундах
const formatDuration = (seconds: number): string => {
  if (!seconds) return '0хв';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}г ${minutes}хв`;
  } else if (minutes > 0) {
    return `${minutes}хв ${secs}с`;
  } else {
    return `${secs}с`;
  }
};

// Компонент для відображення поточного активного таймера
const ActiveTimerDisplay = () => {
  const { activeTimer } = useActiveTimer();
  const stopTimer = useStopTimer();
  const [currentTime, setCurrentTime] = useState(0);

  React.useEffect(() => {
    if (activeTimer) {
      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - new Date(activeTimer.startTime).getTime()) / 1000);
        setCurrentTime(elapsed);
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTimer]);

  if (!activeTimer) return null;

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        mb: 3, 
        backgroundColor: 'primary.main', 
        color: 'primary.contrastText',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <TimerIcon />
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {activeTimer.task?.title}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {formatDuration(currentTime)}
          </Typography>
        </Box>
      </Box>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<StopIcon />}
        onClick={() => stopTimer.mutate(activeTimer.id)}
        disabled={stopTimer.isPending}
      >
        Зупинити
      </Button>
    </Paper>
  );
};

// Компонент для відображення статистики часу завдання
const TaskTimeStats = ({ taskId }: { taskId: string }) => {
  const { data: timeStats } = useTimeStats(taskId);
  
  if (!timeStats?.success || !timeStats.data?.totalTime) return null;

  return (
    <Box display="flex" alignItems="center" gap={1} mt={1}>
      <TimeIcon fontSize="small" color="action" />
      <Typography variant="caption" color="text.secondary">
        Витрачено: {formatDuration(timeStats.data.totalTime)}
      </Typography>
    </Box>
  );
};

export default function TasksPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TaskFilters>({
    status: undefined,
    priority: undefined,
    search: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timeEntryDialogOpen, setTimeEntryDialogOpen] = useState(false);
  const [selectedTaskForTime, setSelectedTaskForTime] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as TaskPriority,
    status: 'TODO' as TaskStatus,
    archived: false,
    projectId: '',
  });
  const [newTimeEntry, setNewTimeEntry] = useState({
    description: '',
    duration: '',
    startTime: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm format
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const { tasks: rawTasks = [], isLoading } = useTasks(filter);
  const tasks = Array.isArray(rawTasks) ? rawTasks : [];
  const { projects = [], isLoading: isLoadingProjects } = useProjects();
  const { activeTimer } = useActiveTimer();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const startTimer = useStartTimer();
  const stopTimer = useStopTimer();
  const createTimeEntry = useCreateTimeEntry();

  // Групування завдань за проектами
  const groupedTasks = useMemo(() => {
    const grouped: { [projectId: string]: { project: Project | null; tasks: Task[] } } = {};
    
    // Додаємо всі проекти
    projects.forEach(project => {
      grouped[project.id] = { project, tasks: [] };
    });
    
    // Групуємо завдання
    tasks.forEach(task => {
      const projectId = task.projectId || 'no-project';
      if (!grouped[projectId]) {
        grouped[projectId] = { 
          project: task.project || null, 
          tasks: [] 
        };
      }
      grouped[projectId].tasks.push(task);
    });
    
    // Видаляємо порожні проекти без завдань
    Object.keys(grouped).forEach(projectId => {
      if (grouped[projectId].tasks.length === 0 && projectId !== 'no-project') {
        delete grouped[projectId];
      }
    });
    
    return grouped;
  }, [tasks, projects]);

  const validateTask = () => {
    const errors: {[key: string]: string} = {};
    
    if (!newTask.title.trim()) {
      errors.title = 'Назва завдання обов\'язкова';
    }
    
    if (!newTask.projectId) {
      errors.projectId = 'Оберіть проект для завдання';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTask = () => {
    if (!validateTask()) return;
    
    createTaskMutation.mutate(newTask, {
      onSuccess: () => {
        setDialogOpen(false);
        setNewTask({
          title: '',
          description: '',
          priority: 'MEDIUM' as TaskPriority,
          status: 'TODO' as TaskStatus,
          archived: false,
          projectId: '',
        });
        setValidationErrors({});
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
      projectId: task.projectId || '',
    });
    setValidationErrors({});
    setDialogOpen(true);
  };

  const handleUpdateTask = () => {
    if (!validateTask()) return;
    
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
              projectId: '',
            });
            setValidationErrors({});
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

  const handleStartTimer = (task: Task) => {
    startTimer.mutate({ 
      taskId: task.id, 
      description: `Робота над завданням: ${task.title}` 
    });
  };

  const handleStopTimer = () => {
    if (activeTimer) {
      stopTimer.mutate(activeTimer.id);
    }
  };

  const handleAddTimeEntry = (task: Task) => {
    setSelectedTaskForTime(task);
    setNewTimeEntry({
      description: '',
      duration: '',
      startTime: new Date().toISOString().slice(0, 16),
    });
    setTimeEntryDialogOpen(true);
  };

  const handleCreateTimeEntry = () => {
    if (!selectedTaskForTime || !newTimeEntry.duration) return;

    const durationInSeconds = parseInt(newTimeEntry.duration) * 60; // конвертуємо хвилини в секунди
    const startTime = new Date(newTimeEntry.startTime);
    const endTime = new Date(startTime.getTime() + durationInSeconds * 1000);

    createTimeEntry.mutate({
      taskId: selectedTaskForTime.id,
      description: newTimeEntry.description,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: durationInSeconds,
      isRunning: false,
    }, {
      onSuccess: () => {
        setTimeEntryDialogOpen(false);
        setSelectedTaskForTime(null);
        setNewTimeEntry({
          description: '',
          duration: '',
          startTime: new Date().toISOString().slice(0, 16),
        });
      },
    });
  };

  const handleOpenDialog = () => {
    if (projects.length === 0) {
      return;
    }
    setDialogOpen(true);
  };

  if (isLoading || isLoadingProjects) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
        <Typography ml={2}>Завантаження...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Активний таймер */}
      <ActiveTimerDisplay />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Завдання
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Додати завдання
        </Button>
      </Box>

      {/* Попередження про відсутність проектів */}
      {projects.length === 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => navigate('/projects')}
            >
              Створити проект
            </Button>
          }
        >
          Для створення завдань потрібно спочатку створити хоча б один проект. 
        </Alert>
      )}

      {/* Filters */}
      <Box mb={3} display="flex" gap={2} flexWrap="wrap">
        <TextField
          placeholder="Пошук завдань..."
          value={filter.search || ''}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          sx={{ minWidth: 200 }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Проект</InputLabel>
          <Select
            value={filter.projectId || ''}
            onChange={(e) => setFilter({ ...filter, projectId: e.target.value || undefined })}
          >
            <MenuItem value="">Всі проекти</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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

      {/* Групування завдань за проектами */}
      {Object.keys(groupedTasks).length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            {projects.length === 0 ? 'Створіть проект для початку роботи' : 'Завдання не знайдено'}
          </Typography>
        </Box>
      ) : (
        Object.entries(groupedTasks).map(([projectId, { project, tasks: projectTasks }]) => (
          <Paper key={projectId} sx={{ mb: 2 }}>
            <Accordion defaultExpanded>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  backgroundColor: project?.color ? `${project.color}20` : 'transparent',
                  '&:hover': { 
                    backgroundColor: project?.color ? `${project.color}30` : 'action.hover' 
                  }
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <FolderIcon sx={{ color: project?.color || 'text.secondary' }} />
                  <Typography variant="h6">
                    {project?.name || 'Без проекту'}
                  </Typography>
                  <Chip 
                    label={`${projectTasks.length} завдань`} 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {projectTasks.map((task: Task) => {
                    const isActiveTimer = activeTimer?.taskId === task.id;
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={task.id}>
                        <Card variant="outlined">
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

                            {/* Статистика часу */}
                            <TaskTimeStats taskId={task.id} />

                            <Divider sx={{ my: 1 }} />

                            {/* Кнопки управління часом */}
                            <Box display="flex" gap={1} mt={2}>
                              {isActiveTimer ? (
                                <Tooltip title="Зупинити таймер">
                                  <IconButton
                                    color="error"
                                    onClick={handleStopTimer}
                                    disabled={stopTimer.isPending}
                                  >
                                    <StopIcon />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Запустити таймер">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleStartTimer(task)}
                                    disabled={!!activeTimer || startTimer.isPending}
                                  >
                                    <PlayIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              <Tooltip title="Додати час вручну">
                                <IconButton
                                  color="secondary"
                                  onClick={() => handleAddTimeEntry(task)}
                                >
                                  <ScheduleIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>

                            {task.createdAt && (
                              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                Створено: {formatDate(task.createdAt)}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Paper>
        ))
      )}

      {/* Create/Edit Task Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Редагувати завдання' : 'Створити завдання'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            {/* Обов'язковий вибір проекту */}
            <FormControl fullWidth error={!!validationErrors.projectId}>
              <InputLabel>Проект *</InputLabel>
              <Select
                value={newTask.projectId}
                onChange={(e) => {
                  setNewTask({ ...newTask, projectId: e.target.value });
                  if (validationErrors.projectId) {
                    setValidationErrors(prev => ({ ...prev, projectId: '' }));
                  }
                }}
                required
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box 
                        width={12} 
                        height={12} 
                        borderRadius="50%" 
                        bgcolor={project.color} 
                      />
                      {project.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.projectId && (
                <FormHelperText>{validationErrors.projectId}</FormHelperText>
              )}
            </FormControl>

            <TextField
              label="Назва *"
              value={newTask.title}
              onChange={(e) => {
                setNewTask({ ...newTask, title: e.target.value });
                if (validationErrors.title) {
                  setValidationErrors(prev => ({ ...prev, title: '' }));
                }
              }}
              required
              fullWidth
              error={!!validationErrors.title}
              helperText={validationErrors.title}
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
                <MenuItem value="URGENT">Терміновий</MenuItem>
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
          <Button onClick={() => {
            setDialogOpen(false);
            setValidationErrors({});
          }}>
            Скасувати
          </Button>
          <Button
            onClick={editingTask ? handleUpdateTask : handleCreateTask}
            variant="contained"
            disabled={!newTask.title || !newTask.projectId}
          >
            {editingTask ? 'Оновити' : 'Створити'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Time Entry Dialog */}
      <Dialog open={timeEntryDialogOpen} onClose={() => setTimeEntryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Додати час для: {selectedTaskForTime?.title}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Опис роботи"
              value={newTimeEntry.description}
              onChange={(e) => setNewTimeEntry({ ...newTimeEntry, description: e.target.value })}
              fullWidth
              placeholder="Що ви робили..."
            />
            
            <TextField
              label="Тривалість (хвилини)"
              type="number"
              value={newTimeEntry.duration}
              onChange={(e) => setNewTimeEntry({ ...newTimeEntry, duration: e.target.value })}
              required
              fullWidth
              inputProps={{ min: 1 }}
            />
            
            <TextField
              label="Час початку"
              type="datetime-local"
              value={newTimeEntry.startTime}
              onChange={(e) => setNewTimeEntry({ ...newTimeEntry, startTime: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTimeEntryDialogOpen(false)}>
            Скасувати
          </Button>
          <Button
            onClick={handleCreateTimeEntry}
            variant="contained"
            disabled={!newTimeEntry.duration || createTimeEntry.isPending}
          >
            Додати
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 