import { Router } from 'express';
import * as AssignmentController from '../controllers/AssignmentController.js';
import { authenticate, requireRole } from '../middleware/authenticate.js';

const router = Router();
const canCommand = requireRole('administrator', 'coordinator', 'operator');

router.use(authenticate);

router.post('/', canCommand, AssignmentController.create);
router.patch('/:id/status', canCommand, AssignmentController.updateStatus);

export default router;
