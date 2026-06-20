import * as profileService from '../services/profile.service.js';
import { getLanguage } from '../utils/i18n.js';
import { validateProfileUpdate } from '../validations/profile.validation.js';
import { ERROR_KEYS, translate } from '../utils/errors.i18n.js';

/**
 * Obtiene las preferencias del perfil del usuario autenticado.
 *
 * @type {import('express').RequestHandler}
 */
export async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const profile = await profileService.getProfileByUserId(userId);

    if (!profile) {
      return res.status(200).json({
        userId,
        darkMode: false,
        language: 'es'
      });
    }

    return res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
}

/**
 * Actualiza las preferencias del perfil del usuario autenticado.
 *
 * @type {import('express').RequestHandler}
 */
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const lang = getLanguage(req);
    const validationErrors = validateProfileUpdate(req.body);

    if (validationErrors.length > 0) {
      const details = validationErrors.map(err => ({
        field: err.field,
        message: translate(err.errorKey, lang)
      }));

      return res.status(400).json({
        error: translate(ERROR_KEYS.INVALID_DATA, lang),
        details
      });
    }

    const { darkMode, language } = req.body;
    const updatedProfile = await profileService.updateProfile(userId, { darkMode, language });

    return res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
}
