import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favorite.controller.js';

const router = Router();

// Proteger todas las rutas de favoritos bajo este enrutador
router.use(requireAuth);

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:id', removeFavorite);

export default router;
