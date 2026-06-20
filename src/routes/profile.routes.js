import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';

const router = Router();

// Proteger todas las rutas de perfil bajo este enrutador
router.use(requireAuth);

router.get('/', getProfile);
router.put('/', updateProfile);

export default router;
