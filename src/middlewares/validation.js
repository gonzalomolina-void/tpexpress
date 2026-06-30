import { getLanguage } from '../utils/i18n.js';
import { ERROR_KEYS, translate } from '../utils/errors.i18n.js';

/**
 * Middleware para validar manualmente el cuerpo (body) de la petición antes del controlador.
 * Admite funciones de validación que retornan un Array de errores o un objeto con errorKey.
 *
 * @param {Function} validationFn - Función de validación del body.
 * @returns {import('express').RequestHandler} Middleware de Express.
 */
export function validateBody(validationFn) {
  return (req, res, next) => {
    const lang = getLanguage(req);
    const result = validationFn(req.body);

    if (Array.isArray(result)) {
      if (result.length > 0) {
        const details = result.map(err => ({
          field: err.field,
          message: translate(err.errorKey, lang)
        }));

        return res.status(400).json({
          error: translate(ERROR_KEYS.INVALID_DATA, lang),
          details
        });
      }
    } else if (result && result.errorKey) {
      const err = translate(result.errorKey, lang);

      return res.status(400).json({
        error: err.error,
        message: err.message
      });
    }

    next();
  };
}
