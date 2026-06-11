import jwt from 'jsonwebtoken';
import * as userService from '../services/user.service.js';

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

    // 1. Validar presencia y formato de la cabecera Authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Se requiere un token de autenticacion en la cabecera Authorization con formato Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verificar firma y validez del token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        error: 'Token invalido',
        message: 'El token de autenticacion provisto es invalido o ha expirado'
      });
    }

    // 3. Obtener el usuario asociado y verificar existencia
    const user = await userService.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Usuario no encontrado',
        message: 'El usuario asociado al token ya no existe en el sistema'
      });
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
