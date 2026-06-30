import { Router } from 'express';
import { register, login, refresh, logout, getMe, changePassword } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validation.js';
import {
  validateRegister,
  validateLogin,
  validateRefresh,
  validateLogout,
  validateChangePassword
} from '../validations/auth.validation.js';

const router = Router();

router.post('/register', validateBody(validateRegister), register);
router.post('/login', validateBody(validateLogin), login);
router.post('/refresh', validateBody(validateRefresh), refresh);
router.post('/logout', validateBody(validateLogout), logout);
router.get('/me', requireAuth, getMe);
router.put('/change-password', requireAuth, validateBody(validateChangePassword), changePassword);

export default router;

