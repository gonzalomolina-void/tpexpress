import jwt from 'jsonwebtoken';
import * as userService from '../services/user.service.js';
import { getLanguage } from '../utils/i18n.js';
import { ERROR_KEYS, translate } from '../utils/errors.i18n.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key';

/**
 * Middleware para requerir autenticacion mediante JWT.
 * Valida la cabecera 'Authorization: Bearer <token>', verifica la firma del JWT,
 * obtiene el usuario de la base de datos y lo inyecta en 'req.user' (excluyendo password).
 *
 * @type {import('express').RequestHandler}
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const lang = getLanguage(req);

    // 1. Validar presencia y formato de la cabecera Authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const errorMsg = translate(ERROR_KEYS.UNAUTHORIZED_HEADER, lang);
      return res.status(401).json(errorMsg);
    }

    const token = authHeader.split(' ')[1];

    // 2. Verificar firma y validez del token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      const errorMsg = translate(ERROR_KEYS.TOKEN_INVALID, lang);
      return res.status(401).json(errorMsg);
    }

    // 3. Obtener el usuario asociado y verificar existencia
    const user = await userService.getUserById(decoded.userId);

    if (!user) {
      const errorMsg = translate(ERROR_KEYS.USER_NOT_FOUND, lang);
      return res.status(401).json(errorMsg);
    }

    // 4. Inyectar datos del usuario autenticado en la peticion (excluyendo password)
    const { password: _, role, roleId, ...userWithoutPassword } = user;
    req.user = {
      ...userWithoutPassword,
      role: role.name
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware para requerir un rol especifico.
 * Debe ejecutarse DESPUES de requireAuth.
 *
 * @param {string} role - El rol requerido (por ejemplo 'admin').
 * @returns {import('express').RequestHandler}
 */
export function requireRole(role) {
  return (req, res, next) => {
    const lang = getLanguage(req);

    if (!req.user) {
      const errorMsg = translate(ERROR_KEYS.AUTH_REQUIRED, lang);
      return res.status(401).json(errorMsg);
    }

    if (req.user.role !== role) {
      const errorMsg = translate(ERROR_KEYS.FORBIDDEN_ROLE, lang, role);
      return res.status(403).json(errorMsg);
    }

    next();
  };
}
