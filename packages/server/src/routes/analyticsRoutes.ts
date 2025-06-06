import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getDashboardMetrics,
  getTimeChartData,
  getProjectReport,
  exportReportCSV,
  exportReportPDF,
} from '../controllers/analyticsController';

const router = Router();

// Middleware для всіх маршрутів
router.use(authenticateToken);

// Dashboard метрики
router.get('/dashboard', getDashboardMetrics);

// Діаграми та чарти
router.get('/time-chart', getTimeChartData);

// Звіти
router.get('/projects', getProjectReport);

// Експорт звітів
router.get('/export/csv', exportReportCSV);
router.get('/export/pdf', exportReportPDF);

export default router; 