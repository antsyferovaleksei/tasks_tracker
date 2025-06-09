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
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

// Function for formatting time in seconds
const formatDuration = (seconds: number, t: any): string => {
  if (!seconds) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}${t('tasks.hours').charAt(0)} ${minutes}${t('tasks.minutes').charAt(0)}`;
  } else if (minutes > 0) {
    return `${minutes}${t('tasks.minutes').charAt(0)} ${secs}${t('tasks.seconds').charAt(0)}`;
  } else {
    return `${secs}${t('tasks.seconds').charAt(0)}`;
  }
};

// Component for displaying current active timer
const ActiveTimerDisplay = ({ onStopTimer }: { onStopTimer?: () => void }) => {
  const { activeTimer } = useActiveTimer();
  const { t } = useTranslation();
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

  const handleStopClick = () => {
    if (onStopTimer) {
      onStopTimer();
    } else {
      stopTimer.mutate(activeTimer.id);
    }
  };

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
            {formatDuration(currentTime, t)}
          </Typography>
        </Box>
      </Box>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<StopIcon />}
        onClick={handleStopClick}
        disabled={stopTimer.isPending}
      >
        {t('tasks.stopTimer')}
      </Button>
    </Paper>
  );
};

  // Component for displaying task time statistics
const TaskTimeStats = ({ taskId }: { taskId: string }) => {
  const { data: timeStats, refetch } = useTimeStats(taskId);
  const { t } = useTranslation();
  
  // Update stats every 5 seconds to show real-time changes
  React.useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [refetch]);
  
  if (!timeStats || !timeStats.totalTime) return null;

  const totalSeconds = timeStats.totalTime;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  let timeDisplay = '';
  if (hours > 0) {
    timeDisplay = `${hours}${t('tasks.hours').charAt(0)} ${minutes}${t('tasks.minutes').charAt(0)} ${seconds}${t('tasks.seconds').charAt(0)}`;
  } else if (minutes > 0) {
    timeDisplay = `${minutes}${t('tasks.minutes').charAt(0)} ${seconds}${t('tasks.seconds').charAt(0)}`;
  } else {
    timeDisplay = `${seconds}${t('tasks.seconds').charAt(0)}`;
  }

  return (
    <Box display="flex" alignItems="center" gap={1} mt={1}>
      <TimeIcon fontSize="small" color="action" />
      <Typography variant="caption" color="text.secondary">
        {t('tasks.timeSpent')}: {timeDisplay}
        {timeStats.hasActiveTimer && (
          <Chip 
            label={t('time.running')} 
            size="small" 
            color="primary" 
            sx={{ ml: 1, fontSize: '0.7rem', height: '20px' }}
          />
        )}
      </Typography>
    </Box>
  );
};

export default function TasksPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<TaskFilters>({
    status: undefined,
    priority: undefined,
    search: '',
  });
  const [searchInput, setSearchInput] = useState(filter.search || ''); // Local state for search field
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timeEntryDialogOpen, setTimeEntryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false); // Filters hidden by default
  const [selectedTaskForTime, setSelectedTaskForTime] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
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
  
  // Debug logging
  console.log('Current filter:', filter);
  console.log('Tasks received:', tasks.length, tasks);
  const { projects = [], isLoading: isLoadingProjects } = useProjects();
  const { activeTimer } = useActiveTimer();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const startTimer = useStartTimer();
  const stopTimer = useStopTimer();
  const createTimeEntry = useCreateTimeEntry();

  // Group tasks by projects (show only projects with tasks that match filters)
  const groupedTasks = useMemo(() => {
    const grouped: { [projectId: string]: { project: Project | null; tasks: Task[] } } = {};
    
    // Group only existing tasks (which are already filtered)
    tasks.forEach(task => {
      const projectId = task.projectId || 'no-project';
      if (!grouped[projectId]) {
        // Find project by ID
        const project = projectId === 'no-project' 
          ? null 
          : projects.find(p => p.id === projectId) || null;
        
        grouped[projectId] = { 
          project, 
          tasks: [] 
        };
      }
      grouped[projectId].tasks.push(task);
    });
    
    return grouped;
  }, [tasks, projects]);

  const validateTask = () => {
    const errors: {[key: string]: string} = {};
    
    if (!newTask.title.trim()) {
      errors.title = 'Task title is required';
    }
    
    if (!newTask.projectId) {
      errors.projectId = 'Please select a project for the task';
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

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete.id);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleStartTimer = (task: Task) => {
    startTimer.mutate({ 
      taskId: task.id, 
      description: `Working on task: ${task.title}` 
    });
  };

  const handleStopTimer = () => {
    if (activeTimer) {
      stopTimer.mutate(activeTimer.id, {
        onSuccess: () => {
          // Auto-complete the task when timer is stopped
          if (activeTimer.task && activeTimer.task.status !== 'COMPLETED') {
            updateTaskMutation.mutate({
              id: activeTimer.task.id,
              data: {
                ...activeTimer.task,
                status: 'COMPLETED' as TaskStatus
              }
            });
          }
        }
      });
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

    const durationInMinutes = parseInt(newTimeEntry.duration);
          const durationInSeconds = durationInMinutes * 60; // convert minutes to seconds
    
    // For negative values create entry with negative duration
    const startTime = new Date(newTimeEntry.startTime);
    const endTime = durationInSeconds > 0 
      ? new Date(startTime.getTime() + durationInSeconds * 1000)
      : new Date(startTime.getTime()); // For negative values endTime = startTime

    const description = durationInMinutes < 0 
      ? (newTimeEntry.description || `Subtracted ${Math.abs(durationInMinutes)} minutes`)
      : (newTimeEntry.description || `Added ${durationInMinutes} minutes`);

    createTimeEntry.mutate({
      taskId: selectedTaskForTime.id,
      description: description,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: durationInSeconds, // Can be negative
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
    
    // Set the last created project as default
    const sortedProjects = [...projects].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const latestProject = sortedProjects[0];
    
    setNewTask(prev => ({
      ...prev,
      projectId: latestProject?.id || ''
    }));
    
    setDialogOpen(true);
  };

  const handleSearch = () => {
    console.log('Searching with input:', searchInput);
    const newFilter = { ...filter, search: searchInput };
    console.log('New filter:', newFilter);
    setFilter(newFilter);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setFilter({
      status: undefined,
      priority: undefined,
      search: '',
      projectId: undefined,
    });
  };

  // Check if there are active filters
  const hasActiveFilters = () => {
    return !!(
      searchInput ||
      filter.search ||
      filter.projectId ||
      (filter.status && filter.status.length > 0) ||
      (filter.priority && filter.priority.length > 0)
    );
  };

  // Auto-expand filters when there are active filters
  React.useEffect(() => {
    if (hasActiveFilters()) {
      setFiltersExpanded(true);
    }
  }, [filter, searchInput]);

  if (isLoading || isLoadingProjects) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
        <Typography ml={2}>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Active Timer */}
      <ActiveTimerDisplay onStopTimer={handleStopTimer} />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('tasks.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          {t('tasks.addTask')}
        </Button>
      </Box>

      {/* Warning about missing projects */}
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
              {t('projects.addProject')}
            </Button>
          }
        >
          {t('projects.createProjectFirst')} 
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ mb: 3 }}>
        <Accordion 
          expanded={filtersExpanded} 
          onChange={(event, isExpanded) => setFiltersExpanded(isExpanded)}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              backgroundColor: 'action.hover',
              '&:hover': { 
                backgroundColor: 'action.selected' 
              }
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6">
                {t('tasks.filters')}
              </Typography>
              {hasActiveFilters() && (
                <Chip 
                  label={t('tasks.active')} 
                  size="small" 
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="flex-end">
              <TextField
                placeholder={t('common.search') + "..."}
                value={searchInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchInput(value);
                  // If field is cleared, automatically clear search
                  if (value === '' && filter.search) {
                    setFilter({ ...filter, search: '' });
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                sx={{ minWidth: 200 }}
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>{t('tasks.project')}</InputLabel>
                <Select
                  value={filter.projectId || ''}
                  onChange={(e) => setFilter({ ...filter, projectId: e.target.value || undefined })}
                >
                  <MenuItem value="">{t('tasks.allTasks')}</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>{t('tasks.status')}</InputLabel>
                <Select
                  value={Array.isArray(filter.status) ? filter.status[0] || '' : filter.status || ''}
                  onChange={(e) => {
                    const value = e.target.value as TaskStatus;
                    setFilter({ 
                      ...filter, 
                      status: value ? [value] : undefined 
                    });
                  }}
                >
                  <MenuItem value="">{t('tasks.allTasks')}</MenuItem>
                  <MenuItem value="TODO">{t('tasks.todo')}</MenuItem>
                  <MenuItem value="IN_PROGRESS">{t('tasks.inProgress')}</MenuItem>
                  <MenuItem value="COMPLETED">{t('tasks.completed')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>{t('tasks.priority')}</InputLabel>
                <Select
                  value={Array.isArray(filter.priority) ? filter.priority[0] || '' : filter.priority || ''}
                  onChange={(e) => {
                    const value = e.target.value as TaskPriority;
                    setFilter({ 
                      ...filter, 
                      priority: value ? [value] : undefined 
                    });
                  }}
                >
                  <MenuItem value="">{t('tasks.allTasks')}</MenuItem>
                  <MenuItem value="LOW">{t('tasks.low')}</MenuItem>
                  <MenuItem value="MEDIUM">{t('tasks.medium')}</MenuItem>
                  <MenuItem value="HIGH">{t('tasks.high')}</MenuItem>
                </Select>
              </FormControl>
              {hasActiveFilters() && (
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  sx={{ height: '56px' }}
                >
                  {t('common.clearAll')}
                </Button>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Group tasks by projects */}
      {Object.keys(groupedTasks).length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            {projects.length === 0 ? 'Create a project to get started' : 'No tasks found'}
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
                    {project?.name || t('projects.noProject')}
                  </Typography>
                  <Chip 
                    label={`${projectTasks.length} ${t('tasks.title').toLowerCase()}`} 
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
                                  onClick={() => handleDeleteTask(task)}
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

                            {/* Time statistics */}
                            <TaskTimeStats taskId={task.id} />

                            <Divider sx={{ my: 1 }} />

                            {/* Time management buttons */}
                            <Box display="flex" gap={1} mt={2}>
                              {isActiveTimer ? (
                                <Tooltip title={t('tasks.stopTimer')}>
                                  <IconButton
                                    color="error"
                                    onClick={handleStopTimer}
                                    disabled={stopTimer.isPending}
                                  >
                                    <StopIcon />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title={t('tasks.startTimer')}>
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleStartTimer(task)}
                                    disabled={!!activeTimer || startTimer.isPending}
                                  >
                                    <PlayIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              <Tooltip title={t('tasks.addTimeManually')}>
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
                                {t('common.created')}: {formatDate(task.createdAt)}
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
          {editingTask ? t('tasks.editTask') : t('tasks.addTask')}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            {/* Required project selection */}
            <FormControl fullWidth error={!!validationErrors.projectId}>
              <InputLabel>{t('tasks.project')} *</InputLabel>
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
              label={t('tasks.taskTitle') + " *"}
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
              label={t('tasks.description')}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel>{t('tasks.priority')}</InputLabel>
              <Select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
              >
                <MenuItem value="LOW">{t('tasks.low')}</MenuItem>
                <MenuItem value="MEDIUM">{t('tasks.medium')}</MenuItem>
                <MenuItem value="HIGH">{t('tasks.high')}</MenuItem>
                <MenuItem value="URGENT">{t('tasks.urgent')}</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>{t('tasks.status')}</InputLabel>
              <Select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as TaskStatus })}
              >
                <MenuItem value="TODO">{t('tasks.todo')}</MenuItem>
                <MenuItem value="IN_PROGRESS">{t('tasks.inProgress')}</MenuItem>
                <MenuItem value="COMPLETED">{t('tasks.completed')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
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
          }}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={editingTask ? handleUpdateTask : handleCreateTask}
            variant="contained"
            disabled={!newTask.title || !newTask.projectId}
          >
            {editingTask ? t('common.update') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Time Entry Dialog */}
      <Dialog open={timeEntryDialogOpen} onClose={() => setTimeEntryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {t('time.addTime')} {t('common.for')}: {selectedTaskForTime?.title}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label={t('time.duration') + " (" + t('tasks.minutes') + ") *"}
              type="number"
              value={newTimeEntry.duration}
              onChange={(e) => setNewTimeEntry({ ...newTimeEntry, duration: e.target.value })}
              required
              fullWidth
              inputProps={{ step: 1 }}
              helperText={t('time.durationHelp')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTimeEntryDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleCreateTimeEntry}
            variant="contained"
            disabled={!newTimeEntry.duration || createTimeEntry.isPending}
          >
            {t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Task Confirmation Dialog - matching ProjectsPage style */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('tasks.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('tasks.deleteMessage')} <strong>"{taskToDelete?.title}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('tasks.deleteWarning')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteTaskMutation.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={confirmDeleteTask}
            variant="contained"
            color="error"
            disabled={deleteTaskMutation.isPending}
            startIcon={deleteTaskMutation.isPending ? <CircularProgress size={20} /> : null}
          >
            {deleteTaskMutation.isPending ? t('common.loading') : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 