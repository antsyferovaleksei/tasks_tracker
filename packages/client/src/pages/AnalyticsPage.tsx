import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  TableChart,
} from '@mui/icons-material';
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
  const [isExporting, setIsExporting] = useState(false);
  


  const handleExport = () => {
    if (!dashboardData) return;
    
    setIsExporting(true);
    
    try {
      // Prepare CSV data
      const csvData = [];
      
      // Header
      csvData.push('Metric,Value');
      
      // Summary data
      csvData.push(`Total Tasks,${dashboardData.summary?.totalTasks || 0}`);
      csvData.push(`Completed Tasks,${dashboardData.summary?.completedTasks || 0}`);
      csvData.push(`In Progress Tasks,${dashboardData.summary?.inProgressTasks || 0}`);
      csvData.push(`Overdue Tasks,${dashboardData.summary?.overdueTasks || 0}`);
      csvData.push(`Total Time Spent (hours),${Math.round((dashboardData.summary?.totalTimeSpent || 0) / 3600)}`);
      
      // Daily stats
      if (dashboardData.charts?.dailyStats?.length) {
        csvData.push('\nDaily Statistics');
        csvData.push('Date,Tasks Created,Tasks Completed');
        dashboardData.charts.dailyStats.forEach((stat: any) => {
          csvData.push(`${stat.date},${stat.created},${stat.completed}`);
        });
      }
      
      // Priority stats
      if (dashboardData.charts?.priorityStats?.length) {
        csvData.push('\nPriority Statistics');
        csvData.push('Priority,Count');
        dashboardData.charts.priorityStats.forEach((stat: any) => {
          csvData.push(`${stat.priority},${stat.count}`);
        });
      }
      
      // Create and download CSV
      const csvContent = csvData.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Помилка експорту CSV файлу');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const metrics = dashboardData?.summary;
  const charts = dashboardData?.charts;

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Analytics
        </Typography>
        
        {/* Export Button */}
        <Button
          variant="contained"
          startIcon={<TableChart />}
          onClick={handleExport}
          disabled={isExporting || !dashboardData}
        >
          {isExporting ? 'Exporting...' : 'Export into CSV'}
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                All tasks
              </Typography>
              <Typography variant="h4">
                {metrics?.totalTasks || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4">
                {metrics?.completedTasks || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h4">
                {metrics?.inProgressTasks || 0}
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
                Dailly statistic
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts?.dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="created" fill="#8884d8" name="Створено" />
                  <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                By prioirity
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
                    {(charts?.priorityStats || []).map((entry: any, index: number) => (
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