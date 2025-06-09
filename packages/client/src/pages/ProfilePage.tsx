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
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../hooks';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { authService } from '../api/supabase-auth';
import { formatDate, formatDuration } from '../utils';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, refreshUser } = useSupabaseAuth();
  const { data: dashboardData, isLoading } = useDashboard(30);
  
  // Profile updating через Supabase Auth
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // State for edit dialogs
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.user_metadata?.display_name || user?.email?.split('@')[0] || '',
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

  const metrics = dashboardData?.summary;

  // Calculate average time per task
  const averageTimePerTask = metrics && metrics.completedTasks > 0 
    ? Math.floor(metrics.totalTimeSpent / metrics.completedTasks)
    : 0;

  // Calculate tasks per week (approximately)
  const tasksPerWeek = Math.ceil((metrics?.completedTasks || 0) / 4) || 0;

  const handleUpdateProfile = async () => {
    if (!profileForm.name.trim()) {
      toast.error(t('validation.required'));
      return;
    }
    
    setIsUpdatingProfile(true);
    try {
      await authService.updateProfile({
        display_name: profileForm.name,
      });
      
      // Refresh user data to show updated name
      await refreshUser();
      
      setEditProfileOpen(false);
      toast.success(t('messages.profileUpdated'));
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || t('common.error'));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.newPassword) {
      toast.error(t('validation.required'));
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('validation.passwordMismatch'));
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error(t('validation.minLength').replace('{min}', '6'));
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword(passwordForm.newPassword);
      
      setChangePasswordOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success(t('messages.passwordChanged'));
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || t('common.error'));
    } finally {
      setIsChangingPassword(false);
    }
  };



  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" mb={3}>
        {t('profile.title')}
      </Typography>

      <Grid container spacing={3}>
        {/* User Info Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
              >
                <PersonIcon sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography variant="h5" mb={1}>
                {user?.user_metadata?.display_name || user?.email?.split('@')[0] || t('auth.name')}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                <EmailIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                {user?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                <CalendarIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                {t('profile.registered')}: {user?.created_at ? formatDate(user.created_at) : t('tasks.noTimeSet')}
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => {
                  setProfileForm({
                    name: user?.user_metadata?.display_name || user?.email?.split('@')[0] || '',
                  });
                  setEditProfileOpen(true);
                }}
                sx={{ mb: 1, width: '100%' }}
              >
                {t('profile.editProfile')}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setChangePasswordOpen(true)}
                sx={{ width: '100%' }}
              >
                {t('profile.changePassword')}
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
                    {t('profile.allTasks')}
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
                    {t('profile.completedTasks')}
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
                    {t('profile.inProgressTasks')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="warning.main">
                    <TimerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {formatDuration(metrics?.totalTimeSpent || 0, t)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('profile.totalTime')}
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
                    {t('profile.productivity')}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" mb={1}>
                        {t('dashboard.completedTasks')}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={parseFloat(metrics?.completionRate || '0')} 
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(parseFloat(metrics?.completionRate || '0'))}% {t('tasks.done').toLowerCase()}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        📊 {t('profile.averageTimePerTask')}: {formatDuration(averageTimePerTask, t)}
                      </Typography>
                      <Typography variant="body2">
                        📅 {t('profile.tasksPerWeek')}: ~{tasksPerWeek}
                      </Typography>
                      <Typography variant="body2">
                        🏢 {t('dashboard.projectsCount')}: {metrics?.projectsCount || 0}
                      </Typography>
                    </Grid>
                  </Grid>

                  {metrics && metrics.overdueTasks > 0 && (
                    <Box mt={2}>
                      <Typography variant="body2" color="error">
                        ⚠️ {t('tasks.overdue')}: {metrics.overdueTasks}
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
        <DialogTitle>{t('profile.editProfile')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('profile.name')}
            fullWidth
            variant="outlined"
            value={profileForm.name}
            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProfileOpen(false)}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleUpdateProfile}
            variant="contained"
            disabled={isUpdatingProfile}
          >
            {isUpdatingProfile ? t('profile.updating') : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('profile.changePassword')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('auth.password')}
            type="password"
            fullWidth
            variant="outlined"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('auth.password')}
            type="password"
            fullWidth
            variant="outlined"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('auth.confirmPassword')}
            type="password"
            fullWidth
            variant="outlined"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleChangePassword}
            variant="contained"
            disabled={isChangingPassword}
          >
            {isChangingPassword ? t('profile.updating') : t('profile.changePassword')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 