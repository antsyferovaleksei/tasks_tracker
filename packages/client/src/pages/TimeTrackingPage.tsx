import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Timer as TimerIcon,
  AccessTime as TimeIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';
import {
  useTimeEntries,
  useCreateTimeEntry,
  useUpdateTimeEntry,
  useDeleteTimeEntry,
  useProjects,
  useTasks,
  useActiveTimer,
  useStartTimer,
  useStopTimer,
} from '../hooks';
import { TimeEntry, Project, Task } from '../types';

// Функція для форматування часу в секундах
const formatDuration = (seconds: number): string => {
  if (!seconds) return '0хв';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}г ${minutes}хв`;
  } else if (minutes > 0) {
    return `${minutes}хв`;
  } else {
    return `${secs}с`;
  }
};

// Компонент активного таймера
const ActiveTimerCard = () => {
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
    <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <TimerIcon fontSize="large" />
            <Box>
              <Typography variant="h6">
                {activeTimer.task?.title}
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatDuration(currentTime)}
              </Typography>
              <Typography variant="body2">
                Проект: {activeTimer.task?.project?.name}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<StopIcon />}
            onClick={() => stopTimer.mutate(activeTimer.id)}
            disabled={stopTimer.isPending}
          >
            Зупинити таймер
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function TimeTrackingPage() {
  const [filters, setFilters] = useState({
    projectId: '',
    taskId: '',
    dateFrom: '',
    dateTo: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    taskId: '',
    description: '',
    duration: '',
    startTime: new Date().toISOString().slice(0, 16),
  });

  const { data: timeEntriesData, isLoading } = useTimeEntries({
    ...filters,
    page: 1,
    limit: 50,
  });
  const timeEntries = timeEntriesData?.data || [];

  const { projects = [] } = useProjects();
  const { tasks: allTasks = [] } = useTasks();
  const createTimeEntry = useCreateTimeEntry();
  const updateTimeEntry = useUpdateTimeEntry();
  const deleteTimeEntry = useDeleteTimeEntry();
  const startTimer = useStartTimer();

  // Фільтруємо завдання за вибраним проектом
  const filteredTasks = filters.projectId 
    ? allTasks.filter(task => task.projectId === filters.projectId)
    : allTasks;

  const handleCreateEntry = () => {
    if (!newEntry.taskId || !newEntry.duration) return;

    const durationInSeconds = parseInt(newEntry.duration) * 60;
    const startTime = new Date(newEntry.startTime);
    const endTime = new Date(startTime.getTime() + durationInSeconds * 1000);

    createTimeEntry.mutate({
      taskId: newEntry.taskId,
      description: newEntry.description,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: durationInSeconds,
      isRunning: false,
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        setNewEntry({
          taskId: '',
          description: '',
          duration: '',
          startTime: new Date().toISOString().slice(0, 16),
        });
      },
    });
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      taskId: entry.taskId,
      description: entry.description || '',
      duration: entry.duration ? Math.floor(entry.duration / 60).toString() : '',
      startTime: entry.startTime.slice(0, 16),
    });
    setDialogOpen(true);
  };

  const handleUpdateEntry = () => {
    if (!editingEntry || !newEntry.duration) return;

    const durationInSeconds = parseInt(newEntry.duration) * 60;
    const startTime = new Date(newEntry.startTime);
    const endTime = new Date(startTime.getTime() + durationInSeconds * 1000);

    updateTimeEntry.mutate({
      id: editingEntry.id,
      data: {
        description: newEntry.description,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: durationInSeconds,
      },
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        setEditingEntry(null);
        setNewEntry({
          taskId: '',
          description: '',
          duration: '',
          startTime: new Date().toISOString().slice(0, 16),
        });
      },
    });
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей запис часу?')) {
      deleteTimeEntry.mutate(id);
    }
  };

  const handleStartTimer = (taskId: string) => {
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
      startTimer.mutate({
        taskId,
        description: `Робота над завданням: ${task.title}`,
      });
    }
  };

  const totalTime = timeEntries.reduce((sum: number, entry: TimeEntry) => sum + (entry.duration || 0), 0);

  if (isLoading) {
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
      <ActiveTimerCard />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Відстеження часу
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Додати запис
        </Button>
      </Box>

      {/* Фільтри */}
      <Box mb={3} display="flex" gap={2} flexWrap="wrap">
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Проект</InputLabel>
          <Select
            value={filters.projectId}
            onChange={(e) => setFilters({ ...filters, projectId: e.target.value, taskId: '' })}
          >
            <MenuItem value="">Всі проекти</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }} disabled={!filters.projectId}>
          <InputLabel>Завдання</InputLabel>
          <Select
            value={filters.taskId}
            onChange={(e) => setFilters({ ...filters, taskId: e.target.value })}
          >
            <MenuItem value="">Всі завдання</MenuItem>
            {filteredTasks.map((task) => (
              <MenuItem key={task.id} value={task.id}>
                {task.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Від"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="До"
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {/* Статистика */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <TimeIcon color="primary" />
            <Typography variant="h6">
              Загальний час: {formatDuration(totalTime)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ({timeEntries.length} записів)
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Таблиця записів часу */}
      {timeEntries.length === 0 ? (
        <Alert severity="info">
          Записи часу не знайдено. Додайте новий запис або запустіть таймер для завдання.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Завдання</TableCell>
                <TableCell>Проект</TableCell>
                <TableCell>Опис</TableCell>
                <TableCell>Початок</TableCell>
                <TableCell>Тривалість</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timeEntries.map((entry: TimeEntry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {entry.task?.title}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Tooltip title="Запустити таймер для цього завдання">
                          <IconButton
                            size="small"
                            onClick={() => handleStartTimer(entry.taskId)}
                            disabled={startTimer.isPending}
                          >
                            <PlayIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        width={12}
                        height={12}
                        borderRadius="50%"
                        bgcolor={entry.task?.project?.color}
                      />
                      {entry.task?.project?.name}
                    </Box>
                  </TableCell>
                  <TableCell>{entry.description || '-'}</TableCell>
                  <TableCell>
                    {format(parseISO(entry.startTime), 'dd.MM.yyyy HH:mm', { locale: uk })}
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {formatDuration(entry.duration || 0)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {entry.isRunning ? (
                      <Chip label="Активний" color="primary" size="small" />
                    ) : (
                      <Chip label="Завершено" color="success" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Редагувати">
                        <IconButton
                          size="small"
                          onClick={() => handleEditEntry(entry)}
                          disabled={entry.isRunning}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Видалити">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteEntry(entry.id)}
                          color="error"
                          disabled={entry.isRunning}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Діалог створення/редагування запису */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEntry ? 'Редагувати запис часу' : 'Додати запис часу'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <FormControl fullWidth disabled={!!editingEntry}>
              <InputLabel>Завдання *</InputLabel>
              <Select
                value={newEntry.taskId}
                onChange={(e) => setNewEntry({ ...newEntry, taskId: e.target.value })}
                required
              >
                {allTasks.map((task) => (
                  <MenuItem key={task.id} value={task.id}>
                    <Box>
                      <Typography>{task.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {task.project?.name}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Опис роботи"
              value={newEntry.description}
              onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="Що ви робили..."
            />

            <TextField
              label="Тривалість (хвилини) *"
              type="number"
              value={newEntry.duration}
              onChange={(e) => setNewEntry({ ...newEntry, duration: e.target.value })}
              required
              fullWidth
              inputProps={{ min: 1 }}
            />

            <TextField
              label="Час початку"
              type="datetime-local"
              value={newEntry.startTime}
              onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDialogOpen(false);
            setEditingEntry(null);
            setNewEntry({
              taskId: '',
              description: '',
              duration: '',
              startTime: new Date().toISOString().slice(0, 16),
            });
          }}>
            Скасувати
          </Button>
          <Button
            onClick={editingEntry ? handleUpdateEntry : handleCreateEntry}
            variant="contained"
            disabled={!newEntry.taskId || !newEntry.duration || createTimeEntry.isPending || updateTimeEntry.isPending}
          >
            {editingEntry ? 'Оновити' : 'Додати'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 