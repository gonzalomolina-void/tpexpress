import { ERROR_KEYS } from '../utils/errors.i18n.js';

/**
 * Valida los datos para agregar una carta a favoritos.
 *
 * @param {Object} body - El cuerpo de la petición.
 * @returns {Array<{field: string, errorKey: string}>} Array de errores de validación.
 */
export function validateAddFavorite(body) {
  const { cardId } = body || {};
  const errors = [];

  const parsedCardId = parseInt(cardId, 10);

  if (cardId === undefined || cardId === null || cardId === '' || isNaN(parsedCardId)) {
    errors.push({ field: 'cardId', errorKey: ERROR_KEYS.INVALID_CARD_ID });
  }

  return errors;
}
