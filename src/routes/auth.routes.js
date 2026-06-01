import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', requireAuth, (req, res) => {
  res.status(200).json(req.user);
});

export default router;

