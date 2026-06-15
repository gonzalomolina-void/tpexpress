import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllRarities } from '../src/controllers/rarity.controller.js';
import * as rarityService from '../src/services/rarity.service.js';
import { getLanguage } from '../src/utils/i18n.js';

// Mockear dependencias externas
vi.mock('../src/services/rarity.service.js');
vi.mock('../src/utils/i18n.js', () => ({
  getLanguage: vi.fn()
}));

describe('Rarity Controller - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      query: {},
      headers: {}
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    next = vi.fn();
  });

  describe('GET /api/rarities', () => {
    it('debería retornar el listado de rarezas traducidas con status 200', async () => {
      const mockRarities = [{ id: 1, code: 'poor', name: 'Pobre' }];
      rarityService.getRarities.mockResolvedValue(mockRarities);
      getLanguage.mockReturnValue('es');

      await getAllRarities(req, res, next);

      expect(getLanguage).toHaveBeenCalledWith(req);
      expect(rarityService.getRarities).toHaveBeenCalledWith({ lang: 'es' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRarities);
      expect(next).not.toHaveBeenCalled();
    });

    it('debería llamar a next con el error si el servicio falla', async () => {
      const serviceError = new Error('Service failure');
      rarityService.getRarities.mockRejectedValue(serviceError);
      getLanguage.mockReturnValue('es');

      await getAllRarities(req, res, next);

      expect(next).toHaveBeenCalledWith(serviceError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
