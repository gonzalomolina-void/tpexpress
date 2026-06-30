import { ERROR_KEYS } from '../utils/errors.i18n.js';

/**
 * Expresion regular basica para validacion de formato de email.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida los datos para el registro de un nuevo usuario.
 * Retorna un array con objetos conteniendo el campo y su clave de error (ERROR_KEYS).
 * Si hay errores de presencia básica, retorna anticipadamente para evitar errores de propiedades.
 *
 * @param {Object} body - El cuerpo de la petición.
 * @returns {Array<{field: string, errorKey: string}>} Array de errores encontrados.
 */
export function validateRegister(body) {
  const { email, name, password } = body || {};
  const errors = [];

  // 1. Validaciones básicas de existencia de campos
  if (email === undefined || email === null || email === '') {
    errors.push({ field: 'email', errorKey: ERROR_KEYS.EMAIL_REQUIRED });
  }

  if (!name || !name.trim()) {
    errors.push({ field: 'name', errorKey: ERROR_KEYS.NAME_REQUIRED });
  }

  if (password === undefined || password === null || password === '') {
    errors.push({ field: 'password', errorKey: ERROR_KEYS.PASSWORD_REQUIRED });
  }

  if (errors.length > 0) {
    return errors;
  }

  // 2. Validaciones de formato y longitud
  if (!EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', errorKey: ERROR_KEYS.EMAIL_INVALID_FORMAT });
  }

  if (name && name.trim().length < 2) {
    errors.push({ field: 'name', errorKey: ERROR_KEYS.NAME_TOO_SHORT });
  }

  if (name && name.trim().length > 50) {
    errors.push({ field: 'name', errorKey: ERROR_KEYS.NAME_TOO_LONG });
  }

  if (password && password.length < 6) {
    errors.push({ field: 'password', errorKey: ERROR_KEYS.PASSWORD_TOO_SHORT });
  }

  return errors;
}

/**
 * Valida los datos para el inicio de sesión de un usuario.
 * Retorna un objeto con la clave de error si falta algún campo, o null si están completos.
 *
 * @param {Object} body - El cuerpo de la petición.
 * @returns {{errorKey: string} | null} Error de validación o null si es válido.
 */
export function validateLogin(body) {
  const { email, password } = body || {};

  if (!email || !password) {
    return { errorKey: ERROR_KEYS.INCOMPLETE_CREDENTIALS };
  }

  return null;
}

/**
 * Valida los datos para el cambio de contraseña de un usuario.
 * Retorna un array con objetos conteniendo el campo y su clave de error (ERROR_KEYS).
 *
 * @param {Object} body - El cuerpo de la petición.
 * @returns {Array<{field: string, errorKey: string}>} Array de errores de validación.
 */
export function validateChangePassword(body) {
  const { currentPassword, newPassword } = body || {};
  const errors = [];

  if (currentPassword === undefined || currentPassword === null || currentPassword === '') {
    errors.push({ field: 'currentPassword', errorKey: ERROR_KEYS.CURRENT_PASSWORD_REQUIRED });
  }

  if (newPassword === undefined || newPassword === null || newPassword === '') {
    errors.push({ field: 'newPassword', errorKey: ERROR_KEYS.NEW_PASSWORD_REQUIRED });
  }

  if (errors.length > 0) {
    return errors;
  }

  if (newPassword && newPassword.length < 6) {
    errors.push({ field: 'newPassword', errorKey: ERROR_KEYS.PASSWORD_TOO_SHORT });
  }

  return errors;
}

/**
 * Valida los datos para el refresco de token.
 * No requiere validaciones específicas del body ya que se maneja por cookies,
 * pero cumple formalmente con el requerimiento de validación del body.
 *
 * @param {Object} body - El cuerpo de la petición.
 * @returns {Array} Array vacío de errores.
 */
export function validateRefresh(body) {
  return [];
}

/**
 * Valida los datos para el cierre de sesión.
 * No requiere validaciones específicas del body ya que se maneja por cookies,
 * pero cumple formalmente con el requerimiento de validación del body.
 *
 * @param {Object} body - El cuerpo de la petición.
 * @returns {Array} Array vacío de errores.
 */
export function validateLogout(body) {
  return [];
}

