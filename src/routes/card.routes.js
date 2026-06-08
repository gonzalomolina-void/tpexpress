import { Router } from 'express';
import { getAllCards, getCardById, createCard, updateCard, deleteCard } from '../controllers/card.controller.js';

const router = Router();

router.get('/cards', getAllCards);
router.get('/cards/:id', getCardById);
router.post('/cards', createCard);
router.put('/cards/:id', updateCard);
router.delete('/cards/:id', deleteCard);

export default router;
