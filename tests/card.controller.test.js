import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllCards, getCardById, getCardForEdit } from '../src/controllers/card.controller.js';
import * as cardService from '../src/services/card.service.js';
import { getLanguage, mapCardToLang, mapCardForEdit } from '../src/utils/i18n.js';

// Mockear dependencias externas
vi.mock('../src/services/card.service.js');
vi.mock('../src/utils/i18n.js', () => ({
  getLanguage: vi.fn(),
  mapCardToLang: vi.fn(card => card), // Mock simple que devuelve el mismo objeto
  mapCardForEdit: vi.fn(card => card)
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
        cursor: null,
        order: 'asc',
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
        cursor: null,
        order: 'asc',
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
        cursor: null,
        order: 'asc',
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

    it('debería soportar query params de cursor y orden', async () => {
      req.query = { cursor: '15', order: 'desc', limit: '5' };
      const mockCards = [{ id: 14 }];
      cardService.getCards.mockResolvedValue({ cards: mockCards, totalCount: 1 });
      getLanguage.mockReturnValue('es');

      await getAllCards(req, res, next);

      expect(cardService.getCards).toHaveBeenCalledWith({
        page: null,
        limit: 5,
        cursor: 15,
        order: 'desc',
        search: undefined,
        type: undefined,
        rarity: undefined,
        lang: 'es'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCards);
    });

    it('debería retornar 400 si el parámetro cursor es inválido (negativo o no-numérico)', async () => {
      req.query = { cursor: '-5' };
      getLanguage.mockReturnValue('es');

      await getAllCards(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String)
        })
      );
      expect(cardService.getCards).not.toHaveBeenCalled();

      // Reset mock and try with text cursor
      vi.clearAllMocks();
      req.query = { cursor: 'abc' };

      await getAllCards(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(cardService.getCards).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/cards/:id/edit', () => {
    it('debería retornar 400 si el ID no es numérico', async () => {
      req.params = { id: 'invalido' };
      getLanguage.mockReturnValue('es');

      await getCardForEdit(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
          details: expect.arrayContaining([
            expect.objectContaining({ field: 'id', message: expect.any(String) })
          ])
        })
      );
    });

    it('debería retornar 404 si la carta no existe', async () => {
      req.params = { id: '999' };
      cardService.getCardById.mockResolvedValue(null);
      getLanguage.mockReturnValue('es');

      await getCardForEdit(req, res, next);

      expect(cardService.getCardById).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
          message: expect.any(String)
        })
      );
    });

    it('debería retornar 200 y el objeto de la carta sin aplanar (con traducciones) si existe', async () => {
      req.params = { id: '1' };
      const mockCardDb = {
        id: 1,
        cost: 3,
        atk: 4,
        def: 5,
        image: '/cards/SirKaelen.png',
        translations: [
          { language: 'es', name: 'Sir Kaelen', description: 'Un caballero...' },
          { language: 'en', name: 'Sir Kaelen', description: 'A knight...' }
        ]
      };

      const mockFormattedCard = {
        id: 1,
        cost: 3,
        atk: 4,
        def: 5,
        image: '/cards/SirKaelen.png',
        typeCode: 'creature',
        rarityCode: 'common',
        translations: {
          es: { name: 'Sir Kaelen', description: 'Un caballero...' },
          en: { name: 'Sir Kaelen', description: 'A knight...' }
        }
      };

      cardService.getCardById.mockResolvedValue(mockCardDb);
      mapCardForEdit.mockReturnValue(mockFormattedCard);

      await getCardForEdit(req, res, next);

      expect(cardService.getCardById).toHaveBeenCalledWith(1);
      expect(mapCardForEdit).toHaveBeenCalledWith(mockCardDb);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockFormattedCard);
    });

    it('debería delegar el error a next si falla el servicio', async () => {
      req.params = { id: '1' };
      const errorMock = new Error('Prisma error');
      cardService.getCardById.mockRejectedValue(errorMock);

      await getCardForEdit(req, res, next);

      expect(next).toHaveBeenCalledWith(errorMock);
    });
  });
});
