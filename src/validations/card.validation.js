import { ERROR_KEYS } from '../utils/errors.i18n.js';

/**
 * Funciones auxiliares para validación de datos.
 */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function isId(value) {
  return Number.isInteger(value) && value > 0;
}

function isEmptyObject(obj) {
  return obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0;
}

/**
 * Valida el array de traducciones enviado en el body.
 *
 * @param {Array} translations - Array de traducciones.
 * @returns {Array<{field: string, errorKey: string}>} Errores de validación de traducciones.
 */
function validateTranslations(translations) {
  const errors = [];

  if (!Array.isArray(translations)) {
    errors.push({ field: 'translations', errorKey: ERROR_KEYS.TRANSLATIONS_NOT_ARRAY });
    return errors;
  }

  if (translations.length === 0) {
    errors.push({ field: 'translations', errorKey: ERROR_KEYS.TRANSLATIONS_EMPTY });
    return errors;
  }

  translations.forEach((translation, index) => {
    if (!translation.language || !['es', 'en'].includes(translation.language)) {
      errors.push({
        field: `translations[${index}].language`,
        errorKey: ERROR_KEYS.TRANSLATION_LANGUAGE_INVALID
      });
    }

    if (!isNonEmptyString(translation.name)) {
      errors.push({
        field: `translations[${index}].name`,
        errorKey: ERROR_KEYS.TRANSLATION_NAME_INVALID
      });
    }

    if (!isNonEmptyString(translation.description)) {
      errors.push({
        field: `translations[${index}].description`,
        errorKey: ERROR_KEYS.TRANSLATION_DESCRIPTION_INVALID
      });
    }
  });

  return errors;
}

/**
 * Valida los datos del body de una carta de forma manual, soportando traducciones anidadas.
 * Retorna un array con los detalles de los errores encontrados.
 *
 * @param {Object} body - El cuerpo de la petición.
 * @returns {Array<{field: string, errorKey: string}>} Array de errores de validación.
 */
export function validateCard(body) {
  const errors = [];

  // 1. Validar que no sea un objeto vacío o nulo
  if (isEmptyObject(body)) {
    errors.push({ field: 'body', errorKey: ERROR_KEYS.BODY_REQUIRED });
    return errors;
  }

  // 2. Validar campos obligatorios y tipos
  if (body.cost === undefined || !isPositiveInteger(body.cost)) {
    errors.push({ field: 'cost', errorKey: ERROR_KEYS.INVALID_COST });
  }

  if (body.atk === undefined || !isPositiveInteger(body.atk)) {
    errors.push({ field: 'atk', errorKey: ERROR_KEYS.INVALID_ATK });
  }

  if (body.def === undefined || !isPositiveInteger(body.def)) {
    errors.push({ field: 'def', errorKey: ERROR_KEYS.INVALID_DEF });
  }

  if (!isNonEmptyString(body.image)) {
    errors.push({ field: 'image', errorKey: ERROR_KEYS.INVALID_IMAGE });
  }

  if (!body.typeId || !isId(body.typeId)) {
    errors.push({ field: 'typeId', errorKey: ERROR_KEYS.INVALID_TYPE_ID });
  }

  if (!body.rarityId || !isId(body.rarityId)) {
    errors.push({ field: 'rarityId', errorKey: ERROR_KEYS.INVALID_RARITY_ID });
  }

  // 3. Validar traducción estructurada
  if (body.translations) {
    const translationErrors = validateTranslations(body.translations);
    errors.push(...translationErrors);
  } else {
    errors.push({ field: 'translations', errorKey: ERROR_KEYS.TRANSLATIONS_REQUIRED });
  }

  return errors;
}
