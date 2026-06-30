import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favorite.controller.js';
import { validateBody } from '../middlewares/validation.js';
import { validateAddFavorite } from '../validations/favorite.validation.js';

const router = Router();

// Proteger todas las rutas de favoritos bajo este enrutador
router.use(requireAuth);

router.get('/', getFavorites);
router.post('/', validateBody(validateAddFavorite), addFavorite);
router.delete('/:id', removeFavorite);

export default router;

