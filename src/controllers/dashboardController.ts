import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

// GET /api/dashboard/stats
export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch total count
    const totalCount = await prisma.application.count({
      where: { userId }
    });

    // Group by status
    const statusCounts = await prisma.application.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        id: true
      }
    });

    // Structure stats counts object with default zeros
    const stats = {
      total: totalCount,
      saved: 0,
      applied: 0,
      assessment: 0,
      interview: 0,
      rejected: 0,
      offer: 0
    };

    // Populate counts based on DB response (case-insensitive key mapping)
    statusCounts.forEach(group => {
      const statusKey = group.status.toLowerCase() as keyof typeof stats;
      if (statusKey in stats) {
        (stats as any)[statusKey] = group._count.id;
      }
    });

    // Fetch 5 recently added applications
    const recentApplications = await prisma.application.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    res.status(200).json({
      stats,
      recentApplications
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'An error occurred while fetching dashboard statistics' });
  }
};
