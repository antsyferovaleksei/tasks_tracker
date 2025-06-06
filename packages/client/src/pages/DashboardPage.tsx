import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  Schedule,
  CheckCircle,
  Warning,
  MoreVert,
  PlayArrow,
  Pause,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardPage: React.FC = () => {
  const theme = useTheme();

  // Mock data for demonstration
  const stats = [
    {
      title: 'Всього завдань',
      value: '24',
      change: '+12%',
      icon: Assignment,
      color: theme.palette.primary.main,
    },
    {
      title: 'Завершено',
      value: '18',
      change: '+8%',
      icon: CheckCircle,
      color: theme.palette.success.main,
    },
    {
      title: 'В роботі',
      value: '4',
      change: '+2',
      icon: Schedule,
      color: theme.palette.warning.main,
    },
    {
      title: 'Прострочено',
      value: '2',
      change: '-1',
      icon: Warning,
      color: theme.palette.error.main,
    },
  ];

  const pieData = [
    { name: 'Завершено', value: 18, color: theme.palette.success.main },
    { name: 'В роботі', value: 4, color: theme.palette.warning.main },
    { name: 'Прострочено', value: 2, color: theme.palette.error.main },
  ];

  const barData = [
    { name: 'Пн', tasks: 4 },
    { name: 'Вт', tasks: 6 },
    { name: 'Ср', tasks: 3 },
    { name: 'Чт', tasks: 8 },
    { name: 'Пт', tasks: 5 },
    { name: 'Сб', tasks: 2 },
    { name: 'Нд', tasks: 1 },
  ];

  const recentTasks = [
    {
      id: 1,
      title: 'Розробка API для аутентифікації',
      project: 'Tasks Tracker',
      priority: 'high',
      dueDate: '2025-06-07',
      progress: 75,
    },
    {
      id: 2,
      title: 'Дизайн головної сторінки',
      project: 'Website Redesign',
      priority: 'medium',
      dueDate: '2025-06-08',
      progress: 45,
    },
    {
      id: 3,
      title: 'Тестування мобільної версії',
      project: 'Mobile App',
      priority: 'low',
      dueDate: '2025-06-10',
      progress: 20,
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Високий';
      case 'medium': return 'Середній';
      case 'low': return 'Низький';
      default: return priority;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Дашборд 📊
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Огляд ваших завдань та продуктивності
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                    border: `1px solid ${stat.color}30`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" component="div" fontWeight="bold" color={stat.color}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {stat.title}
                        </Typography>
                        <Chip
                          label={stat.change}
                          size="small"
                          sx={{
                            backgroundColor: stat.change.startsWith('+') ? 'success.light' : 'error.light',
                            color: stat.change.startsWith('+') ? 'success.dark' : 'error.dark',
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>
                      <Avatar sx={{ backgroundColor: stat.color, width: 56, height: 56 }}>
                        <stat.icon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Charts */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Активність за тиждень
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tasks" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Розподіл завдань
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                {pieData.map((item) => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: item.color,
                        borderRadius: '50%',
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Recent Tasks */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">
                  Останні завдання
                </Typography>
                <IconButton>
                  <MoreVert />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                {recentTasks.map((task, index) => (
                  <Grid item xs={12} md={4} key={task.id}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card
                        sx={{
                          height: '100%',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[8],
                          },
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" component="div" sx={{ mb: 1, fontSize: '1rem' }}>
                                {task.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {task.project}
                              </Typography>
                              <Chip
                                label={getPriorityLabel(task.priority)}
                                size="small"
                                sx={{
                                  backgroundColor: `${getPriorityColor(task.priority)}20`,
                                  color: getPriorityColor(task.priority),
                                  fontWeight: 'bold',
                                }}
                              />
                            </Box>
                            <IconButton size="small">
                              {task.progress < 100 ? <PlayArrow /> : <CheckCircle />}
                            </IconButton>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Прогрес
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {task.progress}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={task.progress}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  backgroundColor: getPriorityColor(task.priority),
                                },
                              }}
                            />
                          </Box>

                          <Typography variant="body2" color="text.secondary">
                            Дедлайн: {new Date(task.dueDate).toLocaleDateString('uk-UA')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default DashboardPage; 