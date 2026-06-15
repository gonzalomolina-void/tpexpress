import prisma from '../prisma/prismaClient.js';

/**
 * Obtiene todas las rarezas de cartas de la base de datos, mapeándolas al idioma correspondiente.
 * 
 * @param {Object} options - Parámetros de consulta.
 * @param {"es" | "en"} options.lang - Idioma solicitado.
 * @returns {Promise<Array<Object>>} Lista de rarezas mapeada.
 */
export async function getRarities({ lang = 'es' }) {
  const rarities = await prisma.rarity.findMany({
    include: {
      translations: true
    },
    orderBy: {
      id: 'asc'
    }
  });

  return rarities.map((rarity) => {
    // Buscar la traducción específica para el idioma solicitado
    let trans = rarity.translations.find((t) => t.language === lang);
    if (!trans) {
      // Fallback al idioma por defecto 'es'
      trans = rarity.translations.find((t) => t.language === 'es') || rarity.translations[0];
    }

    return {
      id: rarity.id,
      code: rarity.code,
      name: trans ? trans.name : '',
      labelKey: `card.rarities.${rarity.code}`
    };
  });
}
