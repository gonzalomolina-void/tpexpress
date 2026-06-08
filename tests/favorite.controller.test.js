import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFavorites, addFavorite, removeFavorite } from '../src/controllers/favorite.controller.js';
import * as favoriteService from '../src/services/favorite.service.js';
import * as cardService from '../src/services/card.service.js';
import { getLanguage, mapCardToLang } from '../src/utils/i18n.js';

// Mockear servicios y utilidades
vi.mock('../src/services/favorite.service.js');
vi.mock('../src/services/card.service.js');
vi.mock('../src/utils/i18n.js');

describe('Favorite Controller - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      user: { id: 1 },
      body: {},
      params: {},
      query: {}
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    next = vi.fn();
  });

  describe('GET /api/favorites', () => {
    it('debería retornar el listado de favoritos formateado en el idioma correcto', async () => {
      getLanguage.mockReturnValue('en');
      const mockRawFavorites = [
        { userId: 1, cardId: 10, card: { id: 10, cost: 3 } }
      ];
      favoriteService.getFavorites.mockResolvedValue(mockRawFavorites);
      mapCardToLang.mockReturnValue({ id: 10, cost: 3, name: 'QA Card' });

      await getFavorites(req, res, next);

      expect(getLanguage).toHaveBeenCalledWith(req);
      expect(favoriteService.getFavorites).toHaveBeenCalledWith(1);
      expect(mapCardToLang).toHaveBeenCalledWith({ id: 10, cost: 3 }, 'en');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 10, cost: 3, name: 'QA Card' }]);
    });

    it('debería delegar el error a next si ocurre una excepción', async () => {
      const error = new Error('Database error');
      favoriteService.getFavorites.mockRejectedValue(error);

      await getFavorites(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('POST /api/favorites', () => {
    it('debería retornar 400 si el cardId no es un número válido', async () => {
      req.body = { cardId: 'invalido' };

      await addFavorite(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Datos inválidos',
          details: [{ field: 'cardId', message: 'El cardId debe ser un número entero válido' }]
        })
      );
    });

    it('debería retornar 404 si la carta indicada no existe', async () => {
      req.body = { cardId: '9999' };
      cardService.getCardById.mockResolvedValue(null);

      await addFavorite(req, res, next);

      expect(cardService.getCardById).toHaveBeenCalledWith(9999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Recurso no encontrado'
        })
      );
    });

    it('debería agregar la carta a favoritos con éxito e indicar 201', async () => {
      req.body = { cardId: 10 };
      cardService.getCardById.mockResolvedValue({ id: 10, cost: 4 });
      favoriteService.addFavorite.mockResolvedValue({ userId: 1, cardId: 10 });

      await addFavorite(req, res, next);

      expect(cardService.getCardById).toHaveBeenCalledWith(10);
      expect(favoriteService.addFavorite).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Carta agregada a favoritos correctamente'
      });
    });

    it('debería delegar el error a next si ocurre una excepción', async () => {
      req.body = { cardId: 10 };
      cardService.getCardById.mockResolvedValue({ id: 10 });
      const error = new Error('Upsert failure');
      favoriteService.addFavorite.mockRejectedValue(error);

      await addFavorite(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('DELETE /api/favorites/:cardId', () => {
    it('debería retornar 400 si el cardId de los parámetros no es válido', async () => {
      req.params = { cardId: 'abc' };

      await removeFavorite(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Datos inválidos',
          details: [{ field: 'cardId', message: 'El ID de la carta debe ser un número entero válido' }]
        })
      );
    });

    it('debería eliminar la carta de favoritos con éxito y retornar 200', async () => {
      req.params = { cardId: '10' };
      favoriteService.removeFavorite.mockResolvedValue({ userId: 1, cardId: 10 });

      await removeFavorite(req, res, next);

      expect(favoriteService.removeFavorite).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Carta eliminada de favoritos correctamente'
      });
    });

    it('debería delegar el error a next si ocurre una excepción al eliminar', async () => {
      req.params = { cardId: '10' };
      const error = new Error('Deletion failure');
      favoriteService.removeFavorite.mockRejectedValue(error);

      await removeFavorite(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
