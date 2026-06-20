import bcrypt from 'bcryptjs';
import prisma from '../prisma/prismaClient.js';
import { ROLES } from '../constants/auth.constants.js';

/**
 * Crea un nuevo usuario en la base de datos con la contraseña hasheada.
 *
 * @param {Object} userData
 * @param {string} userData.email
 * @param {string} userData.name
 * @param {string} userData.password
 * @param {string} [userData.role]
 * @returns {Promise<Object>} El usuario creado.
 */
export async function createUser({ email, name, password, role }) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: {
        connect: { name: role || ROLES.USER }
      },
      profile: {
        create: {}
      }
    },
    include: {
      role: true,
      profile: true
    }
  });
}

/**
 * Obtiene un usuario de la base de datos por su email.
 *
 * @param {string} email
 * @returns {Promise<Object|null>} El usuario o null si no se encuentra.
 */
export async function getUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    include: { role: true, profile: true }
  });
}

/**
 * Obtiene un usuario de la base de datos por su ID.
 *
 * @param {number} id
 * @returns {Promise<Object|null>} El usuario o null si no se encuentra.
 */
export async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: { role: true, profile: true }
  });
}

/**
 * Actualiza la contraseña de un usuario hasheándola antes de guardar.
 *
 * @param {number} id - El ID del usuario.
 * @param {string} newPassword - La nueva contraseña en texto plano.
 * @returns {Promise<Object>} El usuario actualizado.
 */
export async function updateUserPassword(id, newPassword) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword }
  });
}
