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
 * @returns {Array<{field: string, message: string}>} Errores de validación de traducciones.
 */
function validateTranslations(translations) {
  const errors = [];

  if (!Array.isArray(translations)) {
    errors.push({ field: 'translations', message: 'Debe ser un array' });
    return errors;
  }

  if (translations.length === 0) {
    errors.push({ field: 'translations', message: 'Debe tener al menos una traducción' });
    return errors;
  }

  translations.forEach((translation, index) => {
    if (!translation.language || !['es', 'en'].includes(translation.language)) {
      errors.push({ 
        field: `translations[${index}].language`, 
        message: 'Debe ser "es" o "en"' 
      });
    }

    if (!isNonEmptyString(translation.name)) {
      errors.push({ 
        field: `translations[${index}].name`, 
        message: 'Debe ser un string no vacío' 
      });
    }

    if (!isNonEmptyString(translation.description)) {
      errors.push({ 
        field: `translations[${index}].description`, 
        message: 'Debe ser un string no vacío' 
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
 * @returns {Array<{field: string, message: string}>} Array de errores de validación.
 */
export function validateCard(body) {
  const errors = [];

  // 1. Validar que no sea un objeto vacío o nulo
  if (isEmptyObject(body)) {
    errors.push({ field: 'body', message: 'El body no puede estar vacío' });
    return errors;
  }

  // 2. Validar campos obligatorios y tipos
  if (body.cost === undefined || !isPositiveInteger(body.cost)) {
    errors.push({ field: 'cost', message: 'Debe ser un número entero >= 0' });
  }

  if (body.atk === undefined || !isPositiveInteger(body.atk)) {
    errors.push({ field: 'atk', message: 'Debe ser un número entero >= 0' });
  }

  if (body.def === undefined || !isPositiveInteger(body.def)) {
    errors.push({ field: 'def', message: 'Debe ser un número entero >= 0' });
  }

  if (!isNonEmptyString(body.image)) {
    errors.push({ field: 'image', message: 'Debe ser un string no vacío' });
  }

  if (!body.typeId || !isId(body.typeId)) {
    errors.push({ field: 'typeId', message: 'Debe ser un ID válido (número > 0)' });
  }

  if (!body.rarityId || !isId(body.rarityId)) {
    errors.push({ field: 'rarityId', message: 'Debe ser un ID válido (número > 0)' });
  }

  // 3. Validar traducción estructurada
  if (body.translations) {
    const translationErrors = validateTranslations(body.translations);
    errors.push(...translationErrors);
  } else {
    errors.push({ field: 'translations', message: 'Es requerido' });
  }

  return errors;
}
