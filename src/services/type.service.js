import prisma from '../prisma/prismaClient.js';

/**
 * Obtiene todos los tipos de cartas de la base de datos, mapeándolos al idioma correspondiente.
 *
 * @param {Object} options - Parámetros de consulta.
 * @param {"es" | "en"} options.lang - Idioma solicitado.
 * @returns {Promise<Array<Object>>} Lista de tipos mapeada.
 */
export async function getTypes({ lang = 'es' }) {
  const types = await prisma.cardType.findMany({
    include: {
      translations: true
    },
    orderBy: {
      id: 'asc'
    }
  });

  return types.map(type => {
    // Buscar la traducción específica para el idioma solicitado
    let trans = type.translations.find(t => t.language === lang);

    if (!trans) {
      // Fallback al idioma por defecto 'es'
      trans = type.translations.find(t => t.language === 'es') || type.translations[0];
    }

    return {
      id: type.id,
      code: type.code,
      name: trans ? trans.name : '',
      labelKey: `card.types.${type.code}`
    };
  });
}
