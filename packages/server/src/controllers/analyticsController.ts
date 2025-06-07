import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// Схема для параметрів звіту
const reportParamsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  projectId: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  groupBy: z.enum(['day', 'week', 'month', 'project', 'status', 'priority']).optional(),
});

// Dashboard метрики
export const getDashboardMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Загальні статистики
    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      totalTimeSpent,
      projectsCount,
    ] = await Promise.all([
      // Загальна кількість tasks
      prisma.task.count({
        where: { userId, archived: false },
      }),
      // Виконані task
      prisma.task.count({
        where: { userId, status: 'COMPLETED', archived: false },
      }),
      // Tasks в роботі
      prisma.task.count({
        where: { userId, status: 'IN_PROGRESS', archived: false },
      }),
      // Прострочені task
      prisma.task.count({
        where: {
          userId,
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' },
          archived: false,
        },
      }),
      // Total time
      prisma.timeEntry.aggregate({
        where: {
          userId,
          startTime: { gte: startDate },
        },
        _sum: { duration: true },
      }),
      // Number of projects
      prisma.project.count({
        where: { userId, archived: false },
      }),
    ]);

    // Статистика за taskми по дням (simplified version)
    const recentTasks = await prisma.task.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
        archived: false,
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    // Групуємо по дням
    const dailyStatsMap = new Map();
    recentTasks.forEach(task => {
      const date = task.createdAt.toISOString().split('T')[0];
      if (!dailyStatsMap.has(date)) {
        dailyStatsMap.set(date, { date, created: 0, completed: 0 });
      }
      const stats = dailyStatsMap.get(date);
      stats.created++;
      if (task.status === 'COMPLETED') {
        stats.completed++;
      }
    });

    const dailyStats = Array.from(dailyStatsMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 30);

    // Розподіл tasks By prioirity
    const priorityStats = await prisma.task.groupBy({
      by: ['priority'],
      where: { userId, archived: false },
      _count: { priority: true },
    });

    // Розподіл tasks за статусом
    const statusStats = await prisma.task.groupBy({
      by: ['status'],
      where: { userId, archived: false },
      _count: { status: true },
    });

    // Time по projectах (simplified version)
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId,
        startTime: { gte: startDate },
      },
      include: {
        task: {
          include: {
            project: true,
          },
        },
      },
    });

    const projectTimeMap = new Map();
    timeEntries.forEach(entry => {
      const projectName = entry.task.project?.name || 'No project';
      if (!projectTimeMap.has(projectName)) {
        projectTimeMap.set(projectName, { project_name: projectName, total_time: 0, tasks_count: new Set() });
      }
      const stats = projectTimeMap.get(projectName);
      stats.total_time += entry.duration || 0;
      stats.tasks_count.add(entry.task.id);
    });

    const projectTimeStats = Array.from(projectTimeMap.values())
      .map(stats => ({
        ...stats,
        tasks_count: stats.tasks_count.size,
      }))
      .sort((a, b) => b.total_time - a.total_time)
      .slice(0, 10);

    // Продуктивність по дням тижня (simplified version)
    const weekdayMap = new Map();
    const weekdays = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота'];
    
    timeEntries.forEach(entry => {
      const weekday = weekdays[entry.startTime.getDay()];
      if (!weekdayMap.has(weekday)) {
        weekdayMap.set(weekday, { weekday, total_time: 0, entries_count: 0 });
      }
      const stats = weekdayMap.get(weekday);
      stats.total_time += entry.duration || 0;
      stats.entries_count++;
    });

    const weekdayStats = Array.from(weekdayMap.values())
      .map(stats => ({
        ...stats,
        avg_time: stats.entries_count > 0 ? stats.total_time / stats.entries_count : 0,
      }));

    res.json({
      success: true,
      data: {
        summary: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          overdueTasks,
          totalTimeSpent: totalTimeSpent._sum.duration || 0,
          projectsCount,
          completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0,
        },
        charts: {
          dailyStats,
          priorityStats: priorityStats.map(stat => ({
            priority: stat.priority,
            count: stat._count.priority,
          })),
          statusStats: statusStats.map(stat => ({
            status: stat.status,
            count: stat._count.status,
          })),
          projectTimeStats,
          weekdayStats,
        },
      },
    });
  } catch (error: any) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка отримання метрик dashboard',
    });
  }
};

// Отримання даних для діаграм часу
export const getTimeChartData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const validatedParams = reportParamsSchema.parse(req.query);
    const { startDate, endDate, projectId, groupBy = 'day' } = validatedParams;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Отримуємо записи часу за період
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId,
        startTime: { gte: start, lte: end },
        ...(projectId && { task: { projectId } }),
      },
      include: {
        task: {
          include: {
            project: true,
          },
        },
      },
    });

    let timeData: any[] = [];

    switch (groupBy) {
      case 'day':
        const dayMap = new Map();
        timeEntries.forEach(entry => {
          const period = entry.startTime.toISOString().split('T')[0];
          if (!dayMap.has(period)) {
            dayMap.set(period, { period, total_time: 0, tasks_count: new Set() });
          }
          const stats = dayMap.get(period);
          stats.total_time += entry.duration || 0;
          stats.tasks_count.add(entry.taskId);
        });
        timeData = Array.from(dayMap.values())
          .map(stats => ({ ...stats, tasks_count: stats.tasks_count.size }))
          .sort((a, b) => a.period.localeCompare(b.period));
        break;

      case 'week':
        const weekMap = new Map();
        timeEntries.forEach(entry => {
          const date = new Date(entry.startTime);
          const year = date.getFullYear();
          const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
          const period = `${year}-W${week.toString().padStart(2, '0')}`;
          if (!weekMap.has(period)) {
            weekMap.set(period, { period, total_time: 0, tasks_count: new Set() });
          }
          const stats = weekMap.get(period);
          stats.total_time += entry.duration || 0;
          stats.tasks_count.add(entry.taskId);
        });
        timeData = Array.from(weekMap.values())
          .map(stats => ({ ...stats, tasks_count: stats.tasks_count.size }))
          .sort((a, b) => a.period.localeCompare(b.period));
        break;

      case 'month':
        const monthMap = new Map();
        timeEntries.forEach(entry => {
          const period = entry.startTime.toISOString().substring(0, 7); // YYYY-MM
          if (!monthMap.has(period)) {
            monthMap.set(period, { period, total_time: 0, tasks_count: new Set() });
          }
          const stats = monthMap.get(period);
          stats.total_time += entry.duration || 0;
          stats.tasks_count.add(entry.taskId);
        });
        timeData = Array.from(monthMap.values())
          .map(stats => ({ ...stats, tasks_count: stats.tasks_count.size }))
          .sort((a, b) => a.period.localeCompare(b.period));
        break;

      case 'project':
        const projectMap = new Map();
        timeEntries.forEach(entry => {
          const period = entry.task.project?.name || 'No project';
          if (!projectMap.has(period)) {
            projectMap.set(period, { period, total_time: 0, tasks_count: new Set() });
          }
          const stats = projectMap.get(period);
          stats.total_time += entry.duration || 0;
          stats.tasks_count.add(entry.taskId);
        });
        timeData = Array.from(projectMap.values())
          .map(stats => ({ ...stats, tasks_count: stats.tasks_count.size }))
          .sort((a, b) => b.total_time - a.total_time);
        break;

      default:
        timeData = [];
    }

    res.json({
      success: true,
      data: {
        timeData,
        summary: {
          totalTime: timeData.reduce((sum: number, item: any) => sum + (item.total_time || 0), 0),
          totalTasks: timeData.reduce((sum: number, item: any) => sum + (item.tasks_count || 0), 0),
          period: `${start.toISOString().split('T')[0]} - ${end.toISOString().split('T')[0]}`,
          groupBy,
        },
      },
    });
  } catch (error: any) {
    console.error('Get time chart data error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка отримання даних діаграми часу',
    });
  }
};

// Project report
export const getProjectReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const validatedParams = reportParamsSchema.parse(req.query);
    const { startDate, endDate } = validatedParams;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Отримуємо projectи з taskми та записами часу
    const projects = await prisma.project.findMany({
      where: {
        userId,
        archived: false,
      },
      include: {
        tasks: {
          where: { archived: false },
          include: {
            timeEntries: {
              where: {
                startTime: { gte: start, lte: end },
              },
            },
          },
        },
      },
    });

    const projectsReport = projects.map(project => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length;
      const inProgressTasks = project.tasks.filter(task => task.status === 'IN_PROGRESS').length;
      const overdueTasks = project.tasks.filter(
        task => task.dueDate && task.dueDate < new Date() && task.status !== 'COMPLETED'
      ).length;

      const allTimeEntries = project.tasks.flatMap(task => task.timeEntries);
      const totalTimeSpent = allTimeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
      const timeEntriesCount = allTimeEntries.length;

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        in_progress_tasks: inProgressTasks,
        overdue_tasks: overdueTasks,
        total_time_spent: totalTimeSpent,
        time_entries_count: timeEntriesCount,
        created_at: project.createdAt,
        updated_at: project.updatedAt,
      };
    }).sort((a, b) => b.total_time_spent - a.total_time_spent);

    res.json({
      success: true,
      data: {
        projects: projectsReport,
        summary: {
          totalProjects: projectsReport.length,
          totalTime: projectsReport.reduce((sum: number, project: any) => sum + (project.total_time_spent || 0), 0),
          totalTasks: projectsReport.reduce((sum: number, project: any) => sum + (project.total_tasks || 0), 0),
          completedTasks: projectsReport.reduce((sum: number, project: any) => sum + (project.completed_tasks || 0), 0),
          period: `${start.toISOString().split('T')[0]} - ${end.toISOString().split('T')[0]}`,
        },
      },
    });
  } catch (error: any) {
    console.error('Get project report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting project report',
    });
  }
};

// Експорт звіту в CSV
export const exportReportCSV = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const validatedParams = reportParamsSchema.parse(req.query);
    const { startDate, endDate, projectId } = validatedParams;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Отримуємо всі task для експорту
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        ...(projectId && { projectId }),
        archived: false,
      },
      include: {
        project: true,
        _count: {
          select: {
            timeEntries: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Отримуємо загальний час для кожного task
    const tasksWithTime = await Promise.all(
      tasks.map(async (task) => {
        const timeStats = await prisma.timeEntry.aggregate({
          where: {
            taskId: task.id,
          },
          _sum: {
            duration: true,
          },
        });

        return {
          ...task,
          totalTime: timeStats._sum.duration || 0,
        };
      })
    );

    // Створюємо Excel файл
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Звіт tasks');

    // Заголовки
    worksheet.addRow([
      'Task title',
      'Status',
      'Priority',
      'Project',
      'Дата створення',
      'Термін виконання',
      'Total time (хв)',
      'Кількість записів часу',
      'Description',
    ]);

    // Функція для перекладу статусу
    const translateStatus = (status: string) => {
      switch (status) {
        case 'TODO': return 'До виконання';
        case 'IN_PROGRESS': return 'In Progress';
        case 'COMPLETED': return 'Completed';
        case 'CANCELLED': return 'Скасовано';
        default: return status;
      }
    };

    // Функція для перекладу пріоритету
    const translatePriority = (priority: string) => {
      switch (priority) {
        case 'LOW': return 'Low';
        case 'MEDIUM': return 'Medium';
        case 'HIGH': return 'High';
        case 'URGENT': return 'Urgent';
        default: return priority;
      }
    };

    // Дані
    tasksWithTime.forEach(task => {
      worksheet.addRow([
        task.title,
        translateStatus(task.status),
        translatePriority(task.priority),
        task.project?.name || 'No project',
        task.createdAt.toLocaleDateString('uk-UA'),
        task.dueDate?.toLocaleDateString('uk-UA') || 'Не встановлено',
        Math.round(task.totalTime / 60),
        task._count.timeEntries,
        task.description || '',
      ]);
    });

    // Settings стилів
    worksheet.getRow(1).font = { bold: true };
    worksheet.columns.forEach(column => {
      column.width = 15;
    });

    // Відправляємо файл
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=tasks-report-${new Date().toISOString().split('T')[0]}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    console.error('Export CSV error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка експорту CSV',
    });
  }
};

// Експорт звіту в PDF
export const exportReportPDF = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const validatedParams = reportParamsSchema.parse(req.query);
    const { startDate, endDate, projectId } = validatedParams;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Отримуємо дані
    const [user, timeEntries, totalStats] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.timeEntry.findMany({
        where: {
          userId,
          startTime: { gte: start, lte: end },
          ...(projectId && { task: { projectId } }),
        },
        include: {
          task: {
            include: {
              project: true,
            },
          },
        },
        orderBy: {
          startTime: 'desc',
        },
      }),
      prisma.timeEntry.aggregate({
        where: {
          userId,
          startTime: { gte: start, lte: end },
          ...(projectId && { task: { projectId } }),
        },
        _sum: { duration: true },
        _count: { id: true },
      }),
    ]);

    // Створюємо PDF документ
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=time-report-${start.toISOString().split('T')[0]}-${end.toISOString().split('T')[0]}.pdf`
    );

    doc.pipe(res);

    // Заголовок
    doc.fontSize(20).text('Звіт витраченого часу', { align: 'center' });
    doc.moveDown();

    // Інформація про користувача та період
    doc.fontSize(12);
    doc.text(`Користувач: ${user?.name || user?.email}`);
    doc.text(`Період: ${start.toLocaleDateString('uk-UA')} - ${end.toLocaleDateString('uk-UA')}`);
    doc.moveDown();

    // Загальна статистика
    doc.fontSize(14).text('Загальна статистика:');
    doc.fontSize(12);
    doc.text(`Total time: ${Math.round((totalStats._sum.duration || 0) / 60)} minutes`);
    doc.text(`Кількість записів: ${totalStats._count.id}`);
    doc.text(`Medium час на запис: ${totalStats._count.id > 0 ? Math.round((totalStats._sum.duration || 0) / totalStats._count.id / 60) : 0} minutes`);
    doc.moveDown();

    // Детальний список
    doc.fontSize(14).text('Детальний звіт:');
    doc.moveDown(0.5);

    timeEntries.forEach((entry, index) => {
      if (index > 0 && index % 20 === 0) {
        doc.addPage();
      }

      doc.fontSize(10);
      doc.text(
        `${entry.startTime.toLocaleDateString('uk-UA')} ${entry.startTime.toLocaleTimeString('uk-UA')} - ${
          entry.endTime?.toLocaleTimeString('uk-UA') || 'Активно'
        } (${Math.round((entry.duration || 0) / 60)} хв)`
      );
      doc.text(`Tasks: ${entry.task.title}`);
      doc.text(`Project: ${entry.task.project?.name || 'No project'}`);
      if (entry.description) {
        doc.text(`Description: ${entry.description}`);
      }
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error: any) {
    console.error('Export PDF error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка експорту PDF',
    });
  }
}; 