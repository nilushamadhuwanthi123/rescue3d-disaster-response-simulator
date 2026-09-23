import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as AuthController from '../controllers/AuthController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Auth endpoints get a tighter limit than the general API — brute-forcing
// login/register is the specific risk here.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/refresh', authLimiter, AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.me);

export default router;
