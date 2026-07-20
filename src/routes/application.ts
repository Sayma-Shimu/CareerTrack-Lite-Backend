import { Router } from 'express';
import { 
  createApplication, 
  listApplications, 
  getApplication, 
  updateApplication, 
  deleteApplication 
} from '../controllers/applicationController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Apply auth middleware to all application routes
router.use(authenticateToken as any);

router.post('/', createApplication);
router.get('/', listApplications);
router.get('/:id', getApplication);
router.patch('/:id', updateApplication);
router.delete('/:id', deleteApplication);

export default router;
