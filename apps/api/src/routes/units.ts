import { Router } from 'express';
import * as UnitController from '../controllers/UnitController.js';
import { authenticate, requireRole } from '../middleware/authenticate.js';

const router = Router();
const canCommand = requireRole('administrator', 'coordinator', 'operator');

router.use(authenticate);

router.get('/', UnitController.list);
router.post('/', canCommand, UnitController.create);
router.patch('/:id/status', canCommand, UnitController.updateStatus);

export default router;
