import { ERROR_KEYS } from '../utils/errors.i18n.js';

function isEmptyObject(obj) {
  return obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0;
}

/**
 * Valida los datos para la actualización de un perfil.
 *
 * @param {Object} body - El cuerpo de la petición.
 * @returns {Array<{field: string, errorKey: string}>} Array de errores de validación.
 */
export function validateProfileUpdate(body) {
  const errors = [];

  if (isEmptyObject(body)) {
    errors.push({ field: 'body', errorKey: ERROR_KEYS.BODY_REQUIRED });

    return errors;
  }

  if (body.language !== undefined && !['es', 'en'].includes(body.language)) {
    errors.push({ field: 'language', errorKey: ERROR_KEYS.INVALID_LANGUAGE });
  }

  if (body.darkMode !== undefined && typeof body.darkMode !== 'boolean') {
    errors.push({ field: 'darkMode', errorKey: ERROR_KEYS.INVALID_DARK_MODE });
  }

  return errors;
}
