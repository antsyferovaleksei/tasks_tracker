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
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../hooks';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AnalyticsPage() {
  const { t } = useTranslation();
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
      
      // Headers matching the expected format (using semicolon for proper Excel recognition)
      csvData.push('Task title;Status;Priority;Project;Дата створення;Total time (хв);Кількість записів часу;Description');
      
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
        
        // Add task row - properly escape values for CSV
        const escapeCSV = (value: string | number) => {
          if (typeof value === 'number') return value.toString();
          const str = value.toString();
          // Escape quotes by doubling them and wrap in quotes if contains semicolon, quote, or newline
          if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };
        
        csvData.push([
          escapeCSV(task.title),
          escapeCSV(status),
          escapeCSV(priority),
          escapeCSV(projectName),
          escapeCSV(createdDate),
          escapeCSV(totalTimeMinutes),
          escapeCSV(taskTimeEntries.length),
          escapeCSV(description)
        ].join(';'));
      }
      
      // Create and download CSV with proper encoding
      const csvContent = '\uFEFF' + csvData.join('\n'); // Add BOM for proper UTF-8 encoding
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        
        // Generate filename with current date and time
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const filename = `analytic_report_${year}-${month}-${day}-${hours}-${minutes}-${seconds}.csv`;
        
        link.setAttribute('download', filename);
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
          {t('analytics.title')}
        </Typography>
        
        {/* Export Button */}
        <Button
          variant="contained"
          startIcon={<TableChart />}
          onClick={handleExport}
          disabled={isExporting || !dashboardData}
        >
          {isExporting ? t('common.loading') : t('analytics.exportCSV')}
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('dashboard.totalTasks')}
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
                {t('dashboard.completedTasks')}
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