import { describe, it, expect, vi, beforeEach } from 'vitest';
import { register, login } from '../src/controllers/auth.controller.js';
import * as userService from '../src/services/user.service.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mockear dependencias externas
vi.mock('../src/services/user.service.js');
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

describe('Auth Controller - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Inicializar mocks de peticiones express
    req = {
      body: {}
    };
    
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    
    next = vi.fn();
  });

  describe('POST /api/auth/register', () => {
    it('debería retornar 400 si falta el email o la contraseña', async () => {
      req.body = { email: '', password: '' };

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Datos invalidos',
          details: expect.arrayContaining([
            { field: 'email', message: 'El email es obligatorio' },
            { field: 'password', message: 'La contraseña es obligatoria' }
          ])
        })
      );
    });

    it('debería retornar 400 si el email no es válido o la contraseña tiene menos de 6 caracteres', async () => {
      req.body = { email: 'invalido-email', password: '123' };

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Datos invalidos',
          details: expect.arrayContaining([
            { field: 'email', message: 'El formato del email es invalido' },
            { field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' }
          ])
        })
      );
    });

    it('debería retornar 400 si el email ya está registrado', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      userService.getUserByEmail.mockResolvedValue({ id: 1, email: 'test@example.com' });

      await register(req, res, next);

      expect(userService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Email ya registrado'
        })
      );
    });

    it('debería registrar un nuevo usuario con éxito y retornar 201', async () => {
      req.body = { email: 'new@example.com', password: 'password123' };
      userService.getUserByEmail.mockResolvedValue(null);
      userService.createUser.mockResolvedValue({
        id: 2,
        email: 'new@example.com',
        password: 'hashedpassword',
        role: { name: 'usuario' }
      });

      await register(req, res, next);

      expect(userService.createUser).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      // Debe excluir la contraseña de la respuesta
      expect(res.json).toHaveBeenCalledWith({
        id: 2,
        email: 'new@example.com',
        role: 'usuario'
      });
    });

    it('debería delegar el error a next si ocurre una excepción', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      const testError = new Error('Database connection failed');
      userService.getUserByEmail.mockRejectedValue(testError);

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(testError);
    });
  });

  describe('POST /api/auth/login', () => {
    it('debería retornar 400 si falta email o password', async () => {
      req.body = { email: '', password: '' };

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Credenciales incompletas',
        message: 'Debes proporcionar email y contraseña'
      });
    });

    it('debería retornar 401 si el usuario no existe', async () => {
      req.body = { email: 'nonexistent@example.com', password: 'password123' };
      userService.getUserByEmail.mockResolvedValue(null);

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Credenciales invalidas',
        message: 'El email o la contraseña son incorrectos'
      });
    });

    it('debería retornar 401 si la contraseña es inválida', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      userService.getUserByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword'
      });
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res, next);

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Credenciales invalidas',
        message: 'El email o la contraseña son incorrectos'
      });
    });

    it('debería iniciar sesión con éxito y retornar el token JWT y status 200', async () => {
      req.body = { email: 'test@example.com', password: 'correctpassword' };
      userService.getUserByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
        role: { name: 'admin' }
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mocked-jwt-token');

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          email: 'test@example.com',
          role: 'admin'
        }),
        expect.any(String),
        expect.any(Object)
      );
      expect(res.json).toHaveBeenCalledWith({
        token: 'mocked-jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
          role: 'admin'
        }
      });
    });

    it('debería delegar el error a next si ocurre una excepción en login', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      const testError = new Error('Token generation failed');
      userService.getUserByEmail.mockRejectedValue(testError);

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(testError);
    });
  });
});
