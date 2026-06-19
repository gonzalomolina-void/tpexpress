import { createRequire } from 'module';
import { getLanguage } from '../utils/i18n.js';

const require = createRequire(import.meta.url);
const aboutData = require('../locales/about.json');

/**
 * Obtiene la información de presentación del equipo y su filosofía.
 * Soporta internacionalización en base a ?lang= o Accept-Language.
 *
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Siguiente middleware.
 */
export function getAboutInfo(req, res, next) {
  try {
    const lang = getLanguage(req);
    const translation = aboutData[lang] || aboutData['es'];

    res.status(200).json(translation);
  } catch (error) {
    next(error);
  }
}
