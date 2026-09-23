import { Router } from 'express';
import * as AdminController from '../controllers/AdminController.js';
import { authenticate, requireRole } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate, requireRole('administrator'));

router.get('/users', AdminController.listUsers);
router.patch('/users/:id/role', AdminController.updateUserRole);

export default router;
