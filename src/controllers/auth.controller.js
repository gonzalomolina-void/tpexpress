import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as userService from '../services/user.service.js';

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

    // 1. Validaciones basicas de existencia de campos
    const validationErrors = [];
    if (!email) {
      validationErrors.push({ field: 'email', message: 'El email es obligatorio' });
    }
    if (!password) {
      validationErrors.push({ field: 'password', message: 'La contraseña es obligatoria' });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Datos invalidos',
        details: validationErrors
      });
    }

    // 2. Validaciones de formato y longitud
    if (!EMAIL_REGEX.test(email)) {
      validationErrors.push({ field: 'email', message: 'El formato del email es invalido' });
    }
    if (password.length < 6) {
      validationErrors.push({ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Datos invalidos',
        details: validationErrors
      });
    }

    // 3. Verificar si el email ya esta registrado
    const existingUser = await userService.getUserByEmail(email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        error: 'Email ya registrado',
        details: [{ field: 'email', message: 'El email ingresado ya se encuentra registrado en el sistema' }]
      });
    }

    // 4. Crear el usuario
    const newUser = await userService.createUser({
      email: email.toLowerCase(),
      password
    });

    // 5. Retornar el usuario creado excluyendo la contraseña
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
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

    // 1. Validaciones basicas de existencia de campos
    if (!email || !password) {
      return res.status(400).json({
        error: 'Credenciales incompletas',
        message: 'Debes proporcionar email y contraseña'
      });
    }

    // 2. Buscar usuario por email
    const user = await userService.getUserByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        error: 'Credenciales invalidas',
        message: 'El email o la contraseña son incorrectos'
      });
    }

    // 3. Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Credenciales invalidas',
        message: 'El email o la contraseña son incorrectos'
      });
    }

    // 4. Generar Token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 5. Retornar token y datos del usuario (excluyendo password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
}
