import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllTypes } from '../src/controllers/type.controller.js';
import * as typeService from '../src/services/type.service.js';
import { getLanguage } from '../src/utils/i18n.js';

// Mockear dependencias externas
vi.mock('../src/services/type.service.js');
vi.mock('../src/utils/i18n.js', () => ({
  getLanguage: vi.fn()
}));

describe('Type Controller - Unit Tests', () => {
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

  describe('GET /api/types', () => {
    it('debería retornar el listado de tipos traducidos con status 200', async () => {
      const mockTypes = [{ id: 1, code: 'creature', name: 'Criatura' }];
      typeService.getTypes.mockResolvedValue(mockTypes);
      getLanguage.mockReturnValue('es');

      await getAllTypes(req, res, next);

      expect(getLanguage).toHaveBeenCalledWith(req);
      expect(typeService.getTypes).toHaveBeenCalledWith({ lang: 'es' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTypes);
      expect(next).not.toHaveBeenCalled();
    });

    it('debería llamar a next con el error si el servicio falla', async () => {
      const serviceError = new Error('Service failure');
      typeService.getTypes.mockRejectedValue(serviceError);
      getLanguage.mockReturnValue('es');

      await getAllTypes(req, res, next);

      expect(next).toHaveBeenCalledWith(serviceError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
