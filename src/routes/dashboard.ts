import { Router } from 'express';
import { getStats } from '../controllers/dashboardController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Apply auth middleware to dashboard stats route
router.get('/stats', authenticateToken as any, getStats);

export default router;
