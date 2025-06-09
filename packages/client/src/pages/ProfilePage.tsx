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
import { useDashboard } from '../hooks';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { authService } from '../api/supabase-auth';
import { formatDate, formatDuration } from '../utils';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useSupabaseAuth();
  const { data: dashboardData, isLoading } = useDashboard(30);
  
  // Profile updating через Supabase Auth
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // State for edit dialogs
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.email?.split('@')[0] || '',
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

  const metrics = dashboardData?.summary;

  // Calculate average time per task
  const averageTimePerTask = metrics && metrics.completedTasks > 0 
    ? Math.floor(metrics.totalTimeSpent / metrics.completedTasks)
    : 0;

  // Calculate tasks per week (approximately)
  const tasksPerWeek = Math.ceil((metrics?.completedTasks || 0) / 4) || 0;

  const handleUpdateProfile = async () => {
    if (!profileForm.name.trim()) {
      return;
    }
    
    setIsUpdatingProfile(true);
    try {
      // У Supabase auth профіль оновлюється через updateUser
      // Але поки що просто закриваємо діалог
      setEditProfileOpen(false);
      toast.success('Profile updated!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Error updating profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New Password and confirmation are not the same');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('New Password must have at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      // Поки що просто симулюємо зміну пароля
      // TODO: додати реальну зміну пароля через Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setChangePasswordOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password changed successfully!');
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Error changing password');
    } finally {
      setIsChangingPassword(false);
    }
  };



  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" mb={3}>
        User Profile
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
                {user?.email?.split('@')[0] || 'Користувач'}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                <EmailIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                {user?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                <CalendarIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Registration: {user?.created_at ? formatDate(user.created_at) : 'Невідомо'}
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => {
                  setProfileForm({
                    name: user?.email?.split('@')[0] || '',
                    email: user?.email || '',
                  });
                  setEditProfileOpen(true);
                }}
                sx={{ mb: 1, width: '100%' }}
              >
                Edit profile
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setChangePasswordOpen(true)}
                sx={{ width: '100%' }}
              >
                Change Password
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
                    All tasks
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
                    Completed
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
                    In Progress
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
                    Total time
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
                    Detailed statistic
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" mb={1}>
                        Tasks progress
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={parseFloat(metrics?.completionRate || '0')} 
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(parseFloat(metrics?.completionRate || '0'))}% completed
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        📊 Medium time for a task: {formatDuration(averageTimePerTask)}
                      </Typography>
                      <Typography variant="body2">
                        📅 Tasks durng the week: ~{tasksPerWeek}
                      </Typography>
                      <Typography variant="body2">
                        🏢 Projects: {metrics?.projectsCount || 0}
                      </Typography>
                    </Grid>
                  </Grid>

                  {metrics && metrics.overdueTasks > 0 && (
                    <Box mt={2}>
                      <Typography variant="body2" color="error">
                        ⚠️ Прострочено tasks: {metrics.overdueTasks}
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
        <DialogTitle>Edit profile</DialogTitle>
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
          <Button onClick={() => setEditProfileOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateProfile}
            variant="contained"
            disabled={isUpdatingProfile}
          >
            {isUpdatingProfile ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Confirm new password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleChangePassword}
            variant="contained"
            disabled={isChangingPassword}
          >
            {isChangingPassword ? 'Change...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 