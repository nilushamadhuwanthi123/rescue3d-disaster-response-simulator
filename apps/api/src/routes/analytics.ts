import { Router } from 'express';
import * as AnalyticsController from '../controllers/AnalyticsController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);
router.get('/summary', AnalyticsController.getSummary);

export default router;
