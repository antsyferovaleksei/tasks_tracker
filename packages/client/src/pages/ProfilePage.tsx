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
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Assignment as TaskIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks';
import { formatDate, formatDuration } from '../utils';

export default function ProfilePage() {
  const { user } = useAuth();

  // Mock data for demonstration
  const stats = {
    totalTasks: 45,
    completedTasks: 32,
    inProgressTasks: 8,
    totalTimeSpent: 86400, // seconds
    projectsCount: 5,
    completionRate: 71,
  };

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
                Статистика
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <TaskIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4">{stats.totalTasks}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Всього завдань
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <TaskIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4">{stats.completedTasks}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Завершено
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <TaskIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4">{stats.inProgressTasks}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      В процесі
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <TimerIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4">{formatDuration(stats.totalTimeSpent)}</Typography>
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
                  <Typography variant="body2">{stats.completionRate}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats.completionRate}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {stats.completedTasks} з {stats.totalTasks} завдань завершено
              </Typography>
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
                  <Typography variant="body2">Проекти</Typography>
                  <Chip label={stats.projectsCount} size="small" />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Середній час на завдання</Typography>
                  <Chip 
                    label={formatDuration(Math.floor(stats.totalTimeSpent / stats.completedTasks))} 
                    size="small" 
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Завдань на тиждень</Typography>
                  <Chip label="~7" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 