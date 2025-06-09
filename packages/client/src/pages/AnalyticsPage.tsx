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
  


  const handleExport = async () => {
    if (!dashboardData) return;
    
    setIsExporting(true);
    
    try {
      // Import services for data fetching
      const { tasksService, projectsService, timeEntriesService } = await import('../api/supabase-data');
      
      // Fetch detailed data for CSV export
      const [tasks, projects, timeEntries] = await Promise.all([
        tasksService.getTasks(),
        projectsService.getProjects(),
        timeEntriesService.getTimeEntries({})
      ]);
      
      // Prepare CSV data with task details
      const csvData = [];
      
      // Headers matching the expected format
      csvData.push('Task title,Status,Priority,Project,Дата створення,Total time (хв),Кількість записів часу,Description');
      
      // Process each task
      for (const task of tasks) {
        const project = projects.find((p: any) => p.id === task.project_id);
        const taskTimeEntries = timeEntries.filter((entry: any) => entry.task_id === task.id);
        
        // Calculate total time in minutes
        const totalTimeSeconds = taskTimeEntries.reduce((sum: number, entry: any) => {
          return sum + (entry.duration || 0);
        }, 0);
        const totalTimeMinutes = Math.round(totalTimeSeconds / 60);
        
        // Format date
        const createdDate = new Date(task.created_at).toLocaleDateString('uk-UA');
        
        // Map status to Ukrainian
        const statusMap: { [key: string]: string } = {
          'todo': 'До виконання',
          'in_progress': 'В роботі', 
          'done': 'Завершено'
        };
        
        // Map priority to Ukrainian
        const priorityMap: { [key: string]: string } = {
          'low': 'Низький',
          'medium': 'Середній',
          'high': 'Високий'
        };
        
        const status = statusMap[task.status] || task.status;
        const priority = priorityMap[task.priority] || task.priority;
        const projectName = project?.name || 'Без проекту';
        const description = task.description || '';
        
        // Add task row
        csvData.push([
          `"${task.title}"`,
          status,
          priority,
          `"${projectName}"`,
          createdDate,
          totalTimeMinutes,
          taskTimeEntries.length,
          `"${description}"`
        ].join(','));
      }
      
      // Create and download CSV
      const csvContent = csvData.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `tasks-export-${new Date().toISOString().split('T')[0]}.csv`);
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