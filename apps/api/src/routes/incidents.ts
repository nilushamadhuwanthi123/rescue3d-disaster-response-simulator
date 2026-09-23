import { Router } from 'express';
import * as IncidentController from '../controllers/IncidentController.js';
import * as AssignmentController from '../controllers/AssignmentController.js';
import { authenticate, requireRole } from '../middleware/authenticate.js';

const router = Router();
const canCommand = requireRole('administrator', 'coordinator', 'operator');

router.use(authenticate);

router.get('/', IncidentController.list);
router.get('/:id', IncidentController.getById);
router.post('/', canCommand, IncidentController.create);
router.patch('/:id/status', canCommand, IncidentController.updateStatus);

router.get('/:incidentId/assignments', AssignmentController.listForIncident);

export default router;
