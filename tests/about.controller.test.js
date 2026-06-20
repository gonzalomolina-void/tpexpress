import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAboutInfo } from '../src/controllers/about.controller.js';
import { getLanguage } from '../src/utils/i18n.js';

vi.mock('../src/utils/i18n.js', () => ({
  getLanguage: vi.fn()
}));

describe('About Controller - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('getAboutInfo', () => {
    it('debería retornar el estado 200 y los datos en español por defecto', async () => {
      getLanguage.mockReturnValue('es');

      await getAboutInfo(req, res, next);

      expect(getLanguage).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sobre Nosotros',
          description: expect.any(String),
          developers: expect.any(Array)
        })
      );
    });

    it('debería retornar el estado 200 y los datos en inglés si el idioma es "en"', async () => {
      getLanguage.mockReturnValue('en');

      await getAboutInfo(req, res, next);

      expect(getLanguage).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'About Us',
          description: expect.any(String),
          developers: expect.any(Array)
        })
      );
    });

    it('debería derivar el error a next si ocurre una excepción', async () => {
      const error = new Error('Test Error');
      getLanguage.mockImplementationOnce(() => {
        throw error;
      });

      await getAboutInfo(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
