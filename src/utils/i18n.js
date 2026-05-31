/**
 * Resuelve el idioma objetivo a partir de los query parameters o las cabeceras HTTP.
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @returns {"es" | "en"} El idioma resuelto ("es" por defecto).
 */
export function getLanguage(req) {
  // 1. Buscar en el query parameter ?lang=
  const queryLang = req.query.lang;
  if (queryLang === 'en' || queryLang === 'es') {
    return queryLang;
  }

  // 2. Buscar en la cabecera HTTP Accept-Language
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    // Buscar la primera ocurrencia de "es" o "en" (case-insensitive)
    const matches = acceptLanguage.match(/(es|en)/i);
    if (matches) {
      return matches[0].toLowerCase();
    }
  }

  // 3. Fallback por defecto a español
  return 'es';
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
    typeTrans = card.type?.translations.find(t => t.language === 'es') || card.type?.translations[0];
  }

  // Buscar traducción específica para la rareza
  let rarityTrans = card.rarity?.translations.find(t => t.language === lang);
  if (!rarityTrans) {
    // Fallback al idioma por defecto 'es'
    rarityTrans = card.rarity?.translations.find(t => t.language === 'es') || card.rarity?.translations[0];
  }

  return {
    id: card.id,
    cost: card.cost,
    atk: card.atk,
    def: card.def,
    image: card.image,
    type: typeTrans ? typeTrans.name : (card.type?.code || ''),
    rarity: rarityTrans ? rarityTrans.name : (card.rarity?.code || ''),
    name: cardTrans ? cardTrans.name : '',
    description: cardTrans ? cardTrans.description : '',
    createdAt: card.createdAt,
    updatedAt: card.updatedAt
  };
}
