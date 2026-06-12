import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import * as userService from '../services/user.service.js';
import { getLanguage } from '../utils/i18n.js';
import { AUTH_CONFIG } from '../constants/auth.constants.js';

import { ERROR_KEYS, translate } from '../utils/errors.i18n.js';
import prisma from '../prisma/prismaClient.js';


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
    const { email, password } = req.body;
    const lang = getLanguage(req);

    // 1. Validaciones basicas de existencia de campos
    const validationErrors = [];
    if (!email) {
      validationErrors.push({ field: 'email', message: translate(ERROR_KEYS.EMAIL_REQUIRED, lang) });
    }
    if (!password) {
      validationErrors.push({ field: 'password', message: translate(ERROR_KEYS.PASSWORD_REQUIRED, lang) });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: translate(ERROR_KEYS.INVALID_DATA, lang),
        details: validationErrors
      });
    }

    // 2. Validaciones de formato y longitud
    if (!EMAIL_REGEX.test(email)) {
      validationErrors.push({ field: 'email', message: translate(ERROR_KEYS.EMAIL_INVALID_FORMAT, lang) });
    }
    if (password.length < 6) {
      validationErrors.push({ field: 'password', message: translate(ERROR_KEYS.PASSWORD_TOO_SHORT, lang) });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: translate(ERROR_KEYS.INVALID_DATA, lang),
        details: validationErrors
      });
    }

    // 3. Verificar si el email ya esta registrado
    const existingUser = await userService.getUserByEmail(email.toLowerCase());
    if (existingUser) {
      const err = translate(ERROR_KEYS.EMAIL_ALREADY_REGISTERED, lang);
      return res.status(400).json({
        error: err.error,
        details: [{ field: 'email', message: err.message }]
      });
    }

    // 4. Crear el usuario
    const newUser = await userService.createUser({
      email: email.toLowerCase(),
      password
    });

    // 5. Retornar el usuario creado excluyendo la contraseña y aplanando el rol
    const { password: _, role, roleId, ...userWithoutPassword } = newUser;
    res.status(201).json({
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

    // 1. Validaciones basicas de existencia de campos
    if (!email || !password) {
      const err = translate(ERROR_KEYS.INCOMPLETE_CREDENTIALS, lang);
      return res.status(400).json({
        error: err.error,
        message: err.message
      });
    }

    // 2. Buscar usuario por email
    const user = await userService.getUserByEmail(email.toLowerCase());
    if (!user) {
      const err = translate(ERROR_KEYS.INVALID_CREDENTIALS, lang);
      return res.status(401).json({
        error: err.error,
        message: err.message
      });
    }

    // 3. Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const err = translate(ERROR_KEYS.INVALID_CREDENTIALS, lang);
      return res.status(401).json({
        error: err.error,
        message: err.message
      });
    }

    // 4. Generar Token JWT de acceso (corta duración: 15m)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role.name },
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
    res.status(200).json({
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
      const err = translate(ERROR_KEYS.UNAUTHORIZED, lang) || { error: 'No autorizado', message: 'Sesión expirada o inválida' };
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
      const err = translate(ERROR_KEYS.UNAUTHORIZED, lang) || { error: 'No autorizado', message: 'Sesión expirada o inválida' };
      return res.status(401).json({
        error: err.error || 'No autorizado',
        message: err.message || 'Sesión expirada o inválida'
      });
    }


    const user = tokenRecord.user;
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role.name },
      JWT_SECRET,
      { expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRY }
    );

    res.status(200).json({ token });
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
      await prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { revokedAt: new Date() }
      }).catch(() => {
        // Ignorar si no existe en la base de datos
      });
    }

    // Limpiar cookie
    res.clearCookie(AUTH_CONFIG.COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({ message: 'Sesión cerrada correctamente' });
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
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
}


