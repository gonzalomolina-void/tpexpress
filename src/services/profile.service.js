import prisma from '../prisma/prismaClient.js';

/**
 * Obtiene el perfil de un usuario por su ID.
 *
 * @param {number} userId - El ID del usuario.
 * @returns {Promise<Object|null>} El perfil o null si no existe.
 */
export async function getProfileByUserId(userId) {
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  return profile;
}

/**
 * Actualiza las preferencias de perfil de un usuario.
 *
 * @param {number} userId - El ID del usuario.
 * @param {Object} data - Los campos a actualizar (darkMode, language).
 * @returns {Promise<Object>} El perfil actualizado.
 */
export async function updateProfile(userId, data) {
  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      darkMode: data.darkMode ?? false,
      language: data.language ?? 'es'
    }
  });

  return updatedProfile;
}
