import bcrypt from 'bcryptjs';
import prisma from '../prisma/prismaClient.js';

/**
 * Crea un nuevo usuario en la base de datos con la contraseña hasheada.
 * 
 * @param {Object} userData
 * @param {string} userData.email
 * @param {string} userData.password
 * @returns {Promise<Object>} El usuario creado.
 */
export async function createUser({ email, password }) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword
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
    where: { email }
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
    where: { id }
  });
}
