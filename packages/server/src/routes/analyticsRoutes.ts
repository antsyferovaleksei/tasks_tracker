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

// Middleware for all routes
router.use(authenticateToken);

// Dashboard metrics
router.get('/dashboard', getDashboardMetrics);

// Charts and diagrams
router.get('/time-chart', getTimeChartData);

// Reports
router.get('/projects', getProjectReport);

// Export reports
router.get('/export/csv', exportReportCSV);
router.get('/export/pdf', exportReportPDF);

export default router; 