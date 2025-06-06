import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';

function App() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          🎯 Tasks Tracker
        </Typography>
        <Typography variant="h6" component="p" align="center" color="text.secondary">
          Сучасний веб-додаток для трекінгу завдань
        </Typography>
        
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h5" gutterBottom>
            ✅ Фаза 1 завершена!
          </Typography>
          <Typography variant="body1" paragraph>
            Проект успішно ініціалізований з наступними компонентами:
          </Typography>
          <ul>
            <li>📦 Монорепозиторій з workspace структурою</li>
            <li>⚛️ React 18 + TypeScript + Vite</li>
            <li>🎨 Material-UI для дизайну</li>
            <li>🔄 React Query для стану сервера</li>
            <li>🗄️ Node.js + Express + Prisma</li>
            <li>🐘 PostgreSQL схема бази даних</li>
            <li>🔧 ESLint + Prettier конфігурація</li>
            <li>🐳 Docker конфігурація</li>
            <li>📱 PWA підтримка</li>
          </ul>
          
          <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
            Наступний крок: Фаза 2 - Розробка основної функціональності
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default App; 