import { Router } from 'express';
import { analyzeJobDescription } from '../controllers/aiController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/analyze', authenticateToken as any, analyzeJobDescription);

export default router;
