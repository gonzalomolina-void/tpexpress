import { Router } from 'express';
import {
  getAllCards,
  getCardById,
  getCardForEdit,
  createCard,
  updateCard,
  deleteCard
} from '../controllers/card.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { ROLES } from '../constants/auth.constants.js';
import { validateBody } from '../middlewares/validation.js';
import { validateCard } from '../validations/card.validation.js';

const router = Router();

router.use(requireAuth);

router.get('/', getAllCards);
router.get('/:id', getCardById);
router.get('/:id/edit', requireRole(ROLES.ADMIN), getCardForEdit);

// Rutas de escritura - Protegidas para usuarios admin
router.post('/', requireRole(ROLES.ADMIN), validateBody(validateCard), createCard);
router.put('/:id', requireRole(ROLES.ADMIN), validateBody(validateCard), updateCard);
router.delete('/:id', requireRole(ROLES.ADMIN), deleteCard);

export default router;

