import { Router } from 'express';
import { getAllCards, getCardById } from '../controllers/card.controller.js';

const router = Router();

router.get('/cards', getAllCards);
router.get('/cards/:id', getCardById);

export default router;
