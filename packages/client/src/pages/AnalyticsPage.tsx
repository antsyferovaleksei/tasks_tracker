import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useDashboard } from '../hooks';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AnalyticsPage() {
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

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" mb={3}>
        Аналітика
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Всього завдань
              </Typography>
              <Typography variant="h4">
                {metrics?.totalTasks || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Завершено
              </Typography>
              <Typography variant="h4">
                {metrics?.completedTasks || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                В процесі
              </Typography>
              <Typography variant="h4">
                {metrics?.inProgressTasks || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Прострочено
              </Typography>
              <Typography variant="h4">
                {metrics?.overdueTasks || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Статистика за днями
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts?.dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="created" fill="#8884d8" name="Створено" />
                  <Bar dataKey="completed" fill="#82ca9d" name="Завершено" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                За пріоритетом
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={charts?.priorityStats || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ priority, count }) => `${priority}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(charts?.priorityStats || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 