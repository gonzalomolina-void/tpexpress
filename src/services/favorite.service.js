import prisma from '../prisma/prismaClient.js';

/**
 * Relaciones para incluir en la consulta de favoritos, resolviendo
 * la carta junto con sus traducciones, tipo y rareza.
 */
const INCLUDE_FAVORITE_CARD = {
  card: {
    include: {
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
    }
  }
};

/**
 * Obtiene el listado de favoritos de un usuario.
 * 
 * @param {number} userId - ID del usuario.
 * @returns {Promise<Array<Object>>} Lista de registros favoritos.
 */
export async function getFavorites(userId) {
  return prisma.favorite.findMany({
    where: { userId },
    include: INCLUDE_FAVORITE_CARD,
    orderBy: { createdAt: 'desc' }
  });
}
/**
 * Obtiene un registro de favorito específico para un usuario y carta.
 * 
 * @param {number} userId - ID del usuario.
 * @param {number} cardId - ID de la carta.
 * @returns {Promise<Object|null>} El registro de favorito o null si no existe.
 */
export async function getFavorite(userId, cardId) {
  return prisma.favorite.findUnique({
    where: {
      userId_cardId: { userId, cardId }
    }
  });
}

/**
 * Agrega una carta a favoritos de forma idempotente.
 * 
 * @param {number} userId - ID del usuario.
 * @param {number} cardId - ID de la carta.
 * @returns {Promise<Object>} Registro del favorito creado o actualizado.
 */
export async function addFavorite(userId, cardId) {
  return prisma.favorite.upsert({
    where: {
      userId_cardId: { userId, cardId }
    },
    create: { userId, cardId },
    update: {} // No-op para mantener idempotencia
  });
}

/**
 * Elimina una carta de favoritos de manera segura.
 * Retorna null si la carta no estaba en favoritos.
 * 
 * @param {number} userId - ID del usuario.
 * @param {number} cardId - ID de la carta.
 * @returns {Promise<Object|null>} El registro eliminado o null si no existía.
 */
export async function removeFavorite(userId, cardId) {
  try {
    return await prisma.favorite.delete({
      where: {
        userId_cardId: { userId, cardId }
      }
    });
  } catch (error) {
    // P2025 es el código de error para "An operation failed because it depends on one or more records that were not found"
    if (error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}
