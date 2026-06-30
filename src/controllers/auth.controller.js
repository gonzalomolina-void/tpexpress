import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import * as userService from '../services/user.service.js';
import { getLanguage } from '../utils/i18n.js';
import { AUTH_CONFIG } from '../constants/auth.constants.js';
import { ERROR_KEYS, translate } from '../utils/errors.i18n.js';
import prisma from '../prisma/prismaClient.js';
import {
  validateRegister,
  validateLogin,
  validateChangePassword
} from '../validations/auth.validation.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key';

/**
 * Expresion regular basica para validacion de formato de email.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Controlador para registrar un nuevo usuario.
 * POST /api/auth/register
 *
 * @type {import('express').RequestHandler}
 */
export async function register(req, res, next) {
  try {
    const { email, name, password } = req.body;
    const lang = getLanguage(req);
    const validationErrors = validateRegister(req.body);

    if (validationErrors.length > 0) {
      const details = validationErrors.map(err => ({
        field: err.field,
        message: translate(err.errorKey, lang)
      }));

      return res.status(400).json({
        error: translate(ERROR_KEYS.INVALID_DATA, lang),
        details
      });
    }

    // 3. Verificar si el email ya esta registrado
    const existingUser = await userService.getUserByEmail(email.toLowerCase());

    if (existingUser) {
      const err = translate(ERROR_KEYS.EMAIL_ALREADY_REGISTERED, lang);

      return res.status(409).json({
        error: err.error,
        details: [{ field: 'email', message: err.message }]
      });
    }

    // 4. Crear el usuario
    const newUser = await userService.createUser({
      email: email.toLowerCase(),
      name: name.trim(),
      password
    });

    // 5. Retornar el usuario creado excluyendo la contraseña y aplanando el rol
    const { password: _, role, roleId, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      ...userWithoutPassword,
      role: role.name
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador para iniciar sesion y obtener el token JWT.
 * POST /api/auth/login
 *
 * @type {import('express').RequestHandler}
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const lang = getLanguage(req);

    const validationError = validateLogin(req.body);

    if (validationError) {
      const err = translate(validationError.errorKey, lang);

      return res.status(400).json({
        error: err.error,
        message: err.message
      });
    }

    console.log(`[LOGIN DEBUG] email: ${email}, normalized: ${email.toLowerCase()}`);
    // 2. Buscar usuario por email
    const user = await userService.getUserByEmail(email.toLowerCase());
    console.log(`[LOGIN DEBUG] user found: ${user ? 'YES' : 'NO'}`);

    if (!user) {
      const err = translate(ERROR_KEYS.INVALID_CREDENTIALS, lang);

      return res.status(401).json({
        error: err.error,
        message: err.message
      });
    }

    // 3. Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`[LOGIN DEBUG] password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
      const err = translate(ERROR_KEYS.INVALID_CREDENTIALS, lang);

      return res.status(401).json({
        error: err.error,
        message: err.message
      });
    }

    // 4. Generar Token JWT de acceso (corta duración: 15m)
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.role.name },
      JWT_SECRET,
      { expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRY }
    );

    // Generar Refresh Token opaco
    const refreshTokenString = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días de duración

    // Persistir en base de datos
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        expiresAt,
        userId: user.id
      }
    });

    // Inyectar cookie httpOnly
    res.cookie(AUTH_CONFIG.COOKIE_NAME, refreshTokenString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: AUTH_CONFIG.COOKIE_MAX_AGE
    });

    // 5. Retornar token y datos del usuario (excluyendo password y aplanando el rol)
    const { password: _, role, roleId, ...userWithoutPassword } = user;

    return res.status(200).json({
      token,
      user: {
        ...userWithoutPassword,
        role: role.name
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador para refrescar el token de acceso.
 * POST /api/auth/refresh
 *
 * @type {import('express').RequestHandler}
 */
export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.[AUTH_CONFIG.COOKIE_NAME];
    const lang = getLanguage(req);

    if (!refreshToken) {
      const err = translate(ERROR_KEYS.UNAUTHORIZED, lang) || {
        error: 'No autorizado',
        message: 'Sesión expirada o inválida'
      };

      return res.status(401).json({
        error: err.error || 'No autorizado',
        message: err.message || 'Sesión expirada o inválida'
      });
    }

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { role: true } } }
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date() || tokenRecord.revokedAt) {
      const err = translate(ERROR_KEYS.UNAUTHORIZED, lang) || {
        error: 'No autorizado',
        message: 'Sesión expirada o inválida'
      };

      return res.status(401).json({
        error: err.error || 'No autorizado',
        message: err.message || 'Sesión expirada o inválida'
      });
    }

    const user = tokenRecord.user;
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.role.name },
      JWT_SECRET,
      { expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRY }
    );

    return res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador para cerrar sesion e invalidar el refresh token.
 * POST /api/auth/logout
 *
 * @type {import('express').RequestHandler}
 */
export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.[AUTH_CONFIG.COOKIE_NAME];

    if (refreshToken) {
      // Revocar en base de datos
      await prisma.refreshToken
        .update({
          where: { token: refreshToken },
          data: { revokedAt: new Date() }
        })
        .catch(() => {
          // Ignorar si no existe en la base de datos
        });
    }

    // Limpiar cookie
    res.clearCookie(AUTH_CONFIG.COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador para obtener el perfil del usuario autenticado actual.
 * GET /api/auth/me
 *
 * @type {import('express').RequestHandler}
 */
export async function getMe(req, res, next) {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador para cambiar la contraseña del usuario autenticado actual.
 * PUT /api/auth/change-password
 *
 * @type {import('express').RequestHandler}
 */
export async function changePassword(req, res, next) {
  try {
    const userId = req.user.id;
    const lang = getLanguage(req);
    const validationErrors = validateChangePassword(req.body);

    if (validationErrors.length > 0) {
      const details = validationErrors.map(err => ({
        field: err.field,
        message: translate(err.errorKey, lang)
      }));

      return res.status(400).json({
        error: translate(ERROR_KEYS.INVALID_DATA, lang),
        details
      });
    }

    const { currentPassword, newPassword } = req.body;

    // 1. Obtener usuario de la DB incluyendo la contraseña hasheada
    const user = await userService.getUserById(userId);

    if (!user) {
      const err = translate(ERROR_KEYS.USER_NOT_FOUND, lang);

      return res.status(401).json({
        error: err.error,
        message: err.message
      });
    }

    // 2. Comparar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      const err = translate(ERROR_KEYS.INVALID_CURRENT_PASSWORD, lang);

      return res.status(401).json({
        error: err.error,
        message: err.message
      });
    }

    // 3. Actualizar contraseña
    await userService.updateUserPassword(userId, newPassword);

    return res.status(200).json({
      message:
        lang === 'en' ? 'Password updated successfully' : 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
}
