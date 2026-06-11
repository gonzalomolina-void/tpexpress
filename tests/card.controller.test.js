import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllCards, getCardById } from '../src/controllers/card.controller.js';
import * as cardService from '../src/services/card.service.js';
import { getLanguage, mapCardToLang } from '../src/utils/i18n.js';

// Mockear dependencias externas
vi.mock('../src/services/card.service.js');
vi.mock('../src/utils/i18n.js', () => ({
  getLanguage: vi.fn(),
  mapCardToLang: vi.fn((card) => card) // Mock simple que devuelve el mismo objeto
}));

describe('Card Controller - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      query: {},
      params: {},
      headers: {}
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn()
    };

    next = vi.fn();
  });

  describe('GET /api/cards', () => {
    it('debería retornar el listado de cartas sin filtros ni paginación', async () => {
      const mockCards = [{ id: 1, cost: 2, atk: 2, def: 2 }];
      cardService.getCards.mockResolvedValue({ cards: mockCards, totalCount: 1 });
      getLanguage.mockReturnValue('es');

      await getAllCards(req, res, next);

      expect(getLanguage).toHaveBeenCalledWith(req);
      expect(cardService.getCards).toHaveBeenCalledWith({
        page: null,
        limit: null,
        search: undefined,
        type: undefined,
        rarity: undefined,
        lang: 'es'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCards);
    });

    it('debería soportar paginación y retornar la cabecera X-Total-Count', async () => {
      req.query = { page: '2', limit: '5' };
      const mockCards = [{ id: 1 }, { id: 2 }];
      cardService.getCards.mockResolvedValue({ cards: mockCards, totalCount: 15 });
      getLanguage.mockReturnValue('en');

      await getAllCards(req, res, next);

      expect(cardService.getCards).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        search: undefined,
        type: undefined,
        rarity: undefined,
        lang: 'en'
      });
      expect(res.setHeader).toHaveBeenCalledWith('X-Total-Count', 15);
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Expose-Headers', 'X-Total-Count');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCards);
    });

    it('debería enviar parámetros de búsqueda y filtros al servicio de cartas', async () => {
      req.query = { search: 'mago', type: 'creature', rarity: 'rare' };
      const mockCards = [{ id: 3 }];
      cardService.getCards.mockResolvedValue({ cards: mockCards, totalCount: 1 });
      getLanguage.mockReturnValue('es');

      await getAllCards(req, res, next);

      expect(cardService.getCards).toHaveBeenCalledWith({
        page: null,
        limit: null,
        search: 'mago',
        type: 'creature',
        rarity: 'rare',
        lang: 'es'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCards);
    });

    it('debería delegar el error a next si falla la base de datos', async () => {
      const errorMock = new Error('Database Error');
      cardService.getCards.mockRejectedValue(errorMock);

      await getAllCards(req, res, next);

      expect(next).toHaveBeenCalledWith(errorMock);
    });
  });
});
