import prisma from '../prisma/prismaClient.js';

/**
 * Configuración de las relaciones a incluir para resolver traducciones completas
 */
const INCLUDE_RELATIONS = {
  translations: true,
  type: {
    include: {
      translations: true
    }
  },
  rarity: {
    include: {
      translations: true
    }
  }
};

/**
 * Obtiene las cartas de la base de datos, con soporte opcional para paginación.
 * 
 * @param {Object} options - Parámetros de consulta.
 * @param {number|null} options.page - Número de página (1-indexed).
 * @param {number|null} options.limit - Cantidad máxima de registros por página.
 * @returns {Promise<{ cards: Array<Object>, totalCount: number }>} Las cartas y el total general.
 */
export async function getCards({ page, limit }) {
  const isPaging = page !== null && limit !== null;

  // Si hay paginación, hacemos las dos consultas de forma paralela para mayor performance
  if (isPaging) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [cards, totalCount] = await Promise.all([
      prisma.card.findMany({
        skip,
        take,
        include: INCLUDE_RELATIONS,
        orderBy: { id: 'asc' } // Mantener orden estable
      }),
      prisma.card.count()
    ]);

    return { cards, totalCount };
  }

  // Si no se pide paginación, retornamos el listado completo con un tope de seguridad de 500 registros
  const MAX_UNPAGED_LIMIT = 500;
  const cards = await prisma.card.findMany({
    take: MAX_UNPAGED_LIMIT,
    include: INCLUDE_RELATIONS,
    orderBy: { id: 'asc' }
  });

  return { cards, totalCount: cards.length };
}

/**
 * Obtiene una carta específica por su ID.
 * 
 * @param {number} id - Identificador único de la carta.
 * @returns {Promise<Object|null>} El registro de la carta con sus traducciones o null si no se encuentra.
 */
export async function getCardById(id) {
  return prisma.card.findUnique({
    where: { id },
    include: INCLUDE_RELATIONS
  });
}
