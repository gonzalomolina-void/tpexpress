/**
 * Resuelve el idioma objetivo a partir de los query parameters o las cabeceras HTTP.
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @returns {"es" | "en"} El idioma resuelto ("es" por defecto).
 */
export function getLanguage(req) {
  if (!req.language) return 'es';

  const primaryLang = req.language.split('-')[0].toLowerCase();

  return primaryLang === 'en' ? 'en' : 'es';
}

/**
 * Aplana una entidad Card obtenida de Prisma con sus traducciones
 * relacionales al idioma solicitado, ocultando la estructura relacional de traducciones.
 *
 * @param {Object} card - Registro de carta obtenido de Prisma.
 * @param {"es" | "en"} lang - Idioma objetivo.
 * @returns {Object} Carta aplanada y traducida.
 */
export function mapCardToLang(card, lang) {
  // Buscar traducción específica para la carta
  let cardTrans = card.translations.find(t => t.language === lang);

  if (!cardTrans) {
    // Fallback al idioma por defecto 'es'
    cardTrans = card.translations.find(t => t.language === 'es') || card.translations[0];
  }

  // Buscar traducción específica para el tipo de carta
  let typeTrans = card.type?.translations.find(t => t.language === lang);

  if (!typeTrans) {
    // Fallback al idioma por defecto 'es'
    typeTrans =
      card.type?.translations.find(t => t.language === 'es') || card.type?.translations[0];
  }

  // Buscar traducción específica para la rareza
  let rarityTrans = card.rarity?.translations.find(t => t.language === lang);

  if (!rarityTrans) {
    // Fallback al idioma por defecto 'es'
    rarityTrans =
      card.rarity?.translations.find(t => t.language === 'es') || card.rarity?.translations[0];
  }

  return {
    id: card.id,
    cost: card.cost,
    atk: card.atk,
    def: card.def,
    image: card.image,
    type: typeTrans ? typeTrans.name : card.type?.code || '',
    rarity: rarityTrans ? rarityTrans.name : card.rarity?.code || '',
    name: cardTrans ? cardTrans.name : '',
    description: cardTrans ? cardTrans.description : '',
    createdAt: card.createdAt,
    updatedAt: card.updatedAt
  };
}

/**
 * Mapea una entidad Card de Prisma a la estructura con diccionario
 * de traducciones indexado por idioma para el endpoint de edición.
 *
 * @param {Object} card - Registro de carta obtenido de Prisma.
 * @returns {Object} Carta mapeada para edición.
 */
export function mapCardForEdit(card) {
  const translations = {};

  if (card.translations && Array.isArray(card.translations)) {
    card.translations.forEach(t => {
      translations[t.language] = {
        name: t.name,
        description: t.description
      };
    });
  }

  return {
    id: card.id,
    cost: card.cost,
    atk: card.atk,
    def: card.def,
    image: card.image,
    typeCode: card.type?.code || '',
    rarityCode: card.rarity?.code || '',
    translations
  };
}
