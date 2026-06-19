import { Router } from 'express';
import { getAllRarities } from '../controllers/rarity.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/rarities', getAllRarities);

export default router;
