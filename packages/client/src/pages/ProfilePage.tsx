import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Chip,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Assignment as TaskIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  WorkOutline as ProjectIcon,
} from '@mui/icons-material';
import { useAuth, useDashboard } from '../hooks';
import { formatDate, formatDuration } from '../utils';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: dashboardData, isLoading } = useDashboard(30);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const metrics = dashboardData?.data?.summary;
  const charts = dashboardData?.data?.charts;

  // Розрахуємо середній час на завдання
  const averageTimePerTask = metrics && metrics.completedTasks > 0 
    ? Math.floor(metrics.totalTimeSpent / metrics.completedTasks)
    : 0;

  // Розрахуємо завдання на тиждень (приблизно)
  const tasksPerWeek = Math.ceil((metrics?.completedTasks || 0) / 4) || 0;

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" mb={3}>
        Профіль користувача
      </Typography>

      <Grid container spacing={3}>
        {/* User Info Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                src={user?.avatar}
              >
                <PersonIcon sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography variant="h5" mb={1}>
                {user?.name || 'Користувач'}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                <EmailIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                {user?.email || 'user@example.com'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <CalendarIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Приєднався: {user?.createdAt ? formatDate(user.createdAt) : 'Невідомо'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={3}>
                Статистика за останні 30 днів
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <TaskIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4">{metrics?.totalTasks || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Всього завдань
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <TaskIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4">{metrics?.completedTasks || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Завершено
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <TaskIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4">{metrics?.inProgressTasks || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      В процесі
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <TimerIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4">{formatDuration(metrics?.totalTimeSpent || 0)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Витрачено часу
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Progress Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Прогрес виконання
              </Typography>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Завершено завдань</Typography>
                  <Typography variant="body2">{metrics?.completionRate || 0}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(metrics?.completionRate || '0')}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {metrics?.completedTasks || 0} з {metrics?.totalTasks || 0} завдань завершено
              </Typography>
              
              {metrics && metrics.overdueTasks > 0 && (
                <Box mt={2}>
                  <Typography variant="body2" color="error">
                    ⚠️ Прострочено завдань: {metrics.overdueTasks}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Активність
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <ProjectIcon sx={{ mr: 1, fontSize: 18 }} />
                    <Typography variant="body2">Проекти</Typography>
                  </Box>
                  <Chip label={metrics?.projectsCount || 0} size="small" color="primary" />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <TimerIcon sx={{ mr: 1, fontSize: 18 }} />
                    <Typography variant="body2">Середній час на завдання</Typography>
                  </Box>
                  <Chip 
                    label={averageTimePerTask > 0 ? formatDuration(averageTimePerTask) : 'Немає даних'} 
                    size="small" 
                    color="secondary"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <TrendingUpIcon sx={{ mr: 1, fontSize: 18 }} />
                    <Typography variant="body2">Завдань на тиждень</Typography>
                  </Box>
                  <Chip label={`~${tasksPerWeek}`} size="small" color="success" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Priority Distribution Card */}
        {charts?.priorityStats && charts.priorityStats.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Розподіл за пріоритетом
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  {charts.priorityStats.map((stat, index) => (
                    <Box key={stat.priority} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {stat.priority === 'HIGH' ? 'Високий' : 
                         stat.priority === 'MEDIUM' ? 'Середній' : 
                         stat.priority === 'LOW' ? 'Низький' : 'Терміновий'}
                      </Typography>
                      <Chip 
                        label={stat.count} 
                        size="small" 
                        color={stat.priority === 'URGENT' ? 'error' : 
                               stat.priority === 'HIGH' ? 'warning' : 
                               stat.priority === 'MEDIUM' ? 'info' : 'default'}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Weekly Performance Card */}
        {charts?.weekdayStats && charts.weekdayStats.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Продуктивність по днях тижня
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  {charts.weekdayStats
                    .sort((a, b) => b.avg_time - a.avg_time)
                    .slice(0, 3)
                    .map((stat, index) => (
                    <Box key={stat.weekday} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{stat.weekday}</Typography>
                      <Chip 
                        label={`${formatDuration(Math.floor(stat.avg_time))}/день`} 
                        size="small"
                        color={index === 0 ? 'success' : index === 1 ? 'warning' : 'default'}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
} 