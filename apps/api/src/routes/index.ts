import { Router } from 'express';
import authRoutes from './auth.js';
import incidentRoutes from './incidents.js';
import unitRoutes from './units.js';
import assignmentRoutes from './assignments.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok', time: new Date().toISOString() } });
});

router.use('/auth', authRoutes);
router.use('/incidents', incidentRoutes);
router.use('/units', unitRoutes);
router.use('/assignments', assignmentRoutes);

export default router;
