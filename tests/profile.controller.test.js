import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProfile, updateProfile } from '../src/controllers/profile.controller.js';
import * as profileService from '../src/services/profile.service.js';
import { getLanguage } from '../src/utils/i18n.js';
import { ERROR_KEYS, translate } from '../src/utils/errors.i18n.js';

vi.mock('../src/services/profile.service.js');
vi.mock('../src/utils/i18n.js');

describe('Profile Controller - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    getLanguage.mockReturnValue('es');

    req = {
      user: { id: 10 },
      body: {},
      params: {},
      query: {},
      headers: {}
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    next = vi.fn();
  });

  describe('GET /api/profile', () => {
    it('debería retornar el perfil del usuario autenticado con status 200', async () => {
      const mockProfile = { id: 1, userId: 10, darkMode: false, language: 'es' };
      profileService.getProfileByUserId.mockResolvedValue(mockProfile);

      await getProfile(req, res, next);

      expect(profileService.getProfileByUserId).toHaveBeenCalledWith(10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProfile);
      expect(next).not.toHaveBeenCalled();
    });

    it('debería retornar un perfil con valores por defecto si no existe en la base de datos', async () => {
      // Por robustez, si el perfil no existe, podemos retornar un fallback por defecto o un 404.
      // Elijamos retornar un objeto por defecto (según la práctica común y el spec que espera 200 siempre).
      profileService.getProfileByUserId.mockResolvedValue(null);

      await getProfile(req, res, next);

      expect(profileService.getProfileByUserId).toHaveBeenCalledWith(10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        userId: 10,
        darkMode: false,
        language: 'es'
      });
    });

    it('debería delegar el error a next si ocurre una excepción', async () => {
      const dbError = new Error('Database error');
      profileService.getProfileByUserId.mockRejectedValue(dbError);

      await getProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/profile', () => {
    it('debería actualizar y retornar el perfil si los datos son válidos', async () => {
      const updatedProfile = { id: 1, userId: 10, darkMode: true, language: 'en' };
      req.body = { darkMode: true, language: 'en' };
      profileService.updateProfile.mockResolvedValue(updatedProfile);

      await updateProfile(req, res, next);

      expect(profileService.updateProfile).toHaveBeenCalledWith(10, {
        darkMode: true,
        language: 'en'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedProfile);
      expect(next).not.toHaveBeenCalled();
    });

    it('debería retornar 400 si el idioma no es válido ("es" o "en")', async () => {
      req.body = { language: 'fr' };

      await updateProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: translate(ERROR_KEYS.INVALID_DATA, 'es'),
          details: [{ field: 'language', message: translate(ERROR_KEYS.INVALID_LANGUAGE, 'es') }]
        })
      );
      expect(profileService.updateProfile).not.toHaveBeenCalled();
    });

    it('debería retornar 400 si darkMode no es booleano', async () => {
      req.body = { darkMode: 'yes' };

      await updateProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: translate(ERROR_KEYS.INVALID_DATA, 'es'),
          details: [{ field: 'darkMode', message: translate(ERROR_KEYS.INVALID_DARK_MODE, 'es') }]
        })
      );
      expect(profileService.updateProfile).not.toHaveBeenCalled();
    });

    it('debería delegar el error a next si la actualización en la base de datos falla', async () => {
      req.body = { darkMode: true, language: 'en' };
      const dbError = new Error('Database error');
      profileService.updateProfile.mockRejectedValue(dbError);

      await updateProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
