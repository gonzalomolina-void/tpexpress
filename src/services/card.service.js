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
 * Obtiene las cartas de la base de datos, con soporte opcional para paginación y filtros.
 * 
 * @param {Object} options - Parámetros de consulta.
 * @param {number|null} options.page - Número de página (1-indexed).
 * @param {number|null} options.limit - Cantidad máxima de registros por página.
 * @param {string} [options.search] - Término de búsqueda parcial sobre el nombre.
 * @param {string} [options.type] - Código del tipo de carta ("creature", "spell", "artifact").
 * @param {string} [options.rarity] - Código de la rareza de la carta ("poor", "common", etc.).
 * @param {string} [options.lang] - Idioma de la consulta ("es" o "en", por defecto "es").
 * @returns {Promise<{ cards: Array<Object>, totalCount: number }>} Las cartas y el total general.
 */
export async function getCards({ page, limit, search, type, rarity, lang = 'es' }) {
  const isPaging = page !== null && limit !== null;

  const where = {};

  if (search) {
    where.translations = {
      some: {
        language: lang,
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      }
    };
  }

  if (type) {
    where.type = {
      code: type
    };
  }

  if (rarity) {
    where.rarity = {
      code: rarity
    };
  }

  // Si hay paginación, hacemos las dos consultas de forma paralela para mayor performance
  if (isPaging) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [cards, totalCount] = await Promise.all([
      prisma.card.findMany({
        where,
        skip,
        take,
        include: INCLUDE_RELATIONS,
        orderBy: { id: 'asc' } // Mantener orden estable
      }),
      prisma.card.count({ where })
    ]);

    return { cards, totalCount };
  }

  // Si no se pide paginación, retornamos el listado completo con un tope de seguridad de 500 registros
  const MAX_UNPAGED_LIMIT = 500;
  const cards = await prisma.card.findMany({
    where,
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

/**
 * Verifica si un tipo de carta existe por su ID.
 * @param {number} id - El ID del tipo de carta.
 * @returns {Promise<boolean>} True si existe, false en caso contrario.
 */
export async function checkTypeExists(id) {
  const type = await prisma.cardType.findUnique({ where: { id } });
  return type !== null;
}

/**
 * Verifica si una rareza existe por su ID.
 * @param {number} id - El ID de la rareza.
 * @returns {Promise<boolean>} True si existe, false en caso contrario.
 */
export async function checkRarityExists(id) {
  const rarity = await prisma.rarity.findUnique({ where: { id } });
  return rarity !== null;
}

/**
 * Crea una nueva carta y sus traducciones correspondientes en la base de datos.
 * 
 * @param {Object} data - Datos de la carta y sus traducciones.
 * @returns {Promise<Object>} La carta creada con sus relaciones.
 */
export async function createCard({ cost, atk, def, image, typeId, rarityId, translations }) {
  return prisma.card.create({
    data: {
      cost,
      atk,
      def,
      image,
      typeId,
      rarityId,
      translations: {
        createMany: {
          data: translations.map(t => ({
            language: t.language,
            name: t.name,
            description: t.description
          }))
        }
      }
    },
    include: INCLUDE_RELATIONS
  });
}

/**
 * Actualiza una carta existente y sus traducciones asociadas en una transacción.
 * 
 * @param {number} id - El ID de la carta a actualizar.
 * @param {Object} data - Nuevos datos de la carta.
 * @returns {Promise<Object|null>} La carta actualizada o null si no se encuentra.
 */
export async function updateCard(id, { cost, atk, def, image, typeId, rarityId, translations }) {
  return prisma.$transaction(async (tx) => {
    // Verificar si la carta existe
    const existing = await tx.card.findUnique({ where: { id } });
    if (!existing) return null;

    // Actualizar datos base de la carta
    await tx.card.update({
      where: { id },
      data: {
        cost,
        atk,
        def,
        image,
        typeId,
        rarityId
      }
    });

    // Actualizar traducciones usando upsert
    if (translations && Array.isArray(translations)) {
      for (const t of translations) {
        await tx.cardTranslation.upsert({
          where: {
            cardId_language: {
              cardId: id,
              language: t.language
            }
          },
          update: {
            name: t.name,
            description: t.description
          },
          create: {
            cardId: id,
            language: t.language,
            name: t.name,
            description: t.description
          }
        });
      }
    }

    // Retornar la carta actualizada con todas sus relaciones
    return tx.card.findUnique({
      where: { id },
      include: INCLUDE_RELATIONS
    });
  });
}

/**
 * Elimina una carta de la base de datos por su ID (la eliminación es en cascada).
 * 
 * @param {number} id - El ID de la carta a eliminar.
 * @returns {Promise<Object|null>} El registro eliminado o null si no existe.
 */
export async function deleteCard(id) {
  try {
    return await prisma.card.delete({
      where: { id }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}

