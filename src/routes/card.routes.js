import { Router } from 'express';
import { getAllCards, getCardById, createCard, updateCard, deleteCard } from '../controllers/card.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { ROLES } from '../constants/auth.constants.js';

const router = Router();

router.get('/cards', getAllCards);
router.get('/cards/:id', getCardById);

// Rutas de escritura - Protegidas para usuarios admin
router.post('/cards', requireAuth, requireRole(ROLES.ADMIN), createCard);
router.put('/cards/:id', requireAuth, requireRole(ROLES.ADMIN), updateCard);
router.delete('/cards/:id', requireAuth, requireRole(ROLES.ADMIN), deleteCard);

export default router;
