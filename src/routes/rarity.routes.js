import { Router } from 'express';
import { getAllRarities } from '../controllers/rarity.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.get('/rarities', requireAuth, getAllRarities);

export default router;
