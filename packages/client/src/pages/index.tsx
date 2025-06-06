import React from 'react';
import { Container, Typography, Box } from '@mui/material';

// Template for temporary pages
const createTempPage = (title: string, description?: string) => {
  const Component: React.FC = () => (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description || 'Ця сторінка в розробці...'}
        </Typography>
      </Box>
    </Container>
  );
  return Component;
};

export const RegisterPage = createTempPage('Реєстрація');
export const DashboardPage = createTempPage('Дашборд', 'Головна сторінка з аналітикою');
export const TasksPage = createTempPage('Завдання', 'Список всіх завдань');
export const TaskDetailPage = createTempPage('Деталі завдання');
export const ProjectsPage = createTempPage('Проекти', 'Управління проектами');
export const ProjectDetailPage = createTempPage('Деталі проекту');
export const AnalyticsPage = createTempPage('Аналітика', 'Звіти та статистика');
export const SettingsPage = createTempPage('Налаштування');
export const ProfilePage = createTempPage('Профіль користувача');
export const NotFoundPage = createTempPage('Сторінка не знайдена', 'Такої сторінки не існує'); 