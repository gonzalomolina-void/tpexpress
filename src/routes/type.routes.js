import { Router } from 'express';
import { getAllTypes } from '../controllers/type.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getAllTypes);

export default router;
