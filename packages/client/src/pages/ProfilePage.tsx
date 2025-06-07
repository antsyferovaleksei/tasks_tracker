import React, { useState } from 'react';
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
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Assignment as TaskIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  WorkOutline as ProjectIcon,
  Edit as EditIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth, useDashboard, useUpdateProfile, useChangePassword } from '../hooks';
import { formatDate, formatDuration } from '../utils';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: dashboardData, isLoading } = useDashboard(30);
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  // State for edit dialogs
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });



  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const metrics = dashboardData?.data?.summary;

  // Розрахуємо середній час на завдання
  const averageTimePerTask = metrics && metrics.completedTasks > 0 
    ? Math.floor(metrics.totalTimeSpent / metrics.completedTasks)
    : 0;

  // Розрахуємо завдання на тиждень (приблизно)
  const tasksPerWeek = Math.ceil((metrics?.completedTasks || 0) / 4) || 0;

  const handleUpdateProfile = () => {
    if (!profileForm.name.trim()) {
      return;
    }
    
    updateProfileMutation.mutate({
      name: profileForm.name,
      email: profileForm.email,
    }, {
      onSuccess: () => {
        setEditProfileOpen(false);
      }
    });
  };

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Новий пароль та підтвердження не співпадають');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Новий пароль повинен містити принаймні 6 символів');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    }, {
      onSuccess: () => {
        setChangePasswordOpen(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    });
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
              <Typography variant="body2" color="text.secondary" mb={1}>
                <EmailIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                {user?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                <CalendarIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Реєстрація: {user?.createdAt ? formatDate(user.createdAt) : 'Невідомо'}
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => {
                  setProfileForm({
                    name: user?.name || '',
                    email: user?.email || '',
                  });
                  setEditProfileOpen(true);
                }}
                sx={{ mb: 1, width: '100%' }}
              >
                Редагувати профіль
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setChangePasswordOpen(true)}
                sx={{ width: '100%' }}
              >
                Змінити пароль
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {/* Overall Stats */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    <TaskIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {metrics?.totalTasks || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всього завдань
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success.main">
                    {metrics?.completedTasks || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Завершено
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="info.main">
                    {metrics?.inProgressTasks || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    В процесі
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="warning.main">
                    <TimerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {formatDuration(metrics?.totalTimeSpent || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Загальний час
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Detailed Stats */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={2}>
                    <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Детальна статистика
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" mb={1}>
                        Прогрес виконання завдань
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={parseFloat(metrics?.completionRate || '0')} 
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(parseFloat(metrics?.completionRate || '0'))}% завершено
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        📊 Середній час на завдання: {formatDuration(averageTimePerTask)}
                      </Typography>
                      <Typography variant="body2">
                        📅 Завдань на тиждень: ~{tasksPerWeek}
                      </Typography>
                      <Typography variant="body2">
                        🏢 Проектів: {metrics?.projectsCount || 0}
                      </Typography>
                    </Grid>
                  </Grid>

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
          </Grid>
        </Grid>


      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onClose={() => setEditProfileOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Редагувати профіль</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Ім'я"
            fullWidth
            variant="outlined"
            value={profileForm.name}
            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={profileForm.email}
            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProfileOpen(false)}>Скасувати</Button>
          <Button 
            onClick={handleUpdateProfile}
            variant="contained"
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? 'Збереження...' : 'Зберегти'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Змінити пароль</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Поточний пароль"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Новий пароль"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Підтвердити новий пароль"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)}>Скасувати</Button>
          <Button 
            onClick={handleChangePassword}
            variant="contained"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? 'Зміна...' : 'Змінити пароль'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 