/**
 * Valida los datos del body de una carta de forma manual.
 * Retorna un array con los detalles de los errores encontrados.
 * 
 * @param {Object} body - El cuerpo de la petición.
 * @returns {Array<{field: string, message: string}>} Array de errores de validación.
 */
export function validateCard(body) {
  const errors = [];

  // 1. Validar que no sea un objeto vacío
  if (!body || Object.keys(body).length === 0) {
    errors.push({
      field: 'body',
      message: 'El cuerpo de la petición no puede estar vacío'
    });
    return errors;
  }

  const requiredFields = [
    { name: 'cost', type: 'number', label: 'El costo' },
    { name: 'atk', type: 'number', label: 'El ataque (atk)' },
    { name: 'def', type: 'number', label: 'La defensa (def)' },
    { name: 'image', type: 'string', label: 'La imagen' },
    { name: 'typeId', type: 'number', label: 'El ID del tipo de carta' },
    { name: 'rarityId', type: 'number', label: 'El ID de la rareza' },
    { name: 'nameEs', type: 'string', label: 'El nombre en español' },
    { name: 'descriptionEs', type: 'string', label: 'La descripción en español' },
    { name: 'nameEn', type: 'string', label: 'El nombre en inglés' },
    { name: 'descriptionEn', type: 'string', label: 'La descripción en inglés' }
  ];

  // 2. Validar campos requeridos y tipos de datos
  for (const field of requiredFields) {
    const value = body[field.name];

    // Verificar si está presente (permitiendo el valor 0 para números)
    if (value === undefined || value === null) {
      errors.push({
        field: field.name,
        message: `${field.label} es obligatorio`
      });
      continue;
    }

    // Validar tipo string
    if (field.type === 'string') {
      if (typeof value !== 'string') {
        errors.push({
          field: field.name,
          message: `${field.label} debe ser una cadena de texto`
        });
      } else if (value.trim() === '') {
        errors.push({
          field: field.name,
          message: `${field.label} no puede estar vacío`
        });
      }
    }

    // Validar tipo number
    if (field.type === 'number') {
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push({
          field: field.name,
          message: `${field.label} debe ser un número válido`
        });
      } else {
        // Verificar que sea un número entero
        if (!Number.isInteger(value)) {
          errors.push({
            field: field.name,
            message: `${field.label} debe ser un número entero`
          });
        }
        // Verificar que sea no negativo
        if (value < 0) {
          errors.push({
            field: field.name,
            message: `${field.label} no puede ser menor a 0`
          });
        }
      }
    }
  }

  return errors;
}
