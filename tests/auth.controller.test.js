import { describe, it, expect, vi, beforeEach } from 'vitest';
import { register, login, refresh, logout, getMe } from '../src/controllers/auth.controller.js';
import { AUTH_CONFIG } from '../src/constants/auth.constants.js';
import * as userService from '../src/services/user.service.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../src/prisma/prismaClient.js';

// Mockear dependencias externas
vi.mock('../src/services/user.service.js');
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');
vi.mock('../src/prisma/prismaClient.js', () => ({
  default: {
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn()
    }
  }
}));

describe('Auth Controller - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();

    // Inicializar mocks de peticiones express
    req = {
      body: {},
      cookies: {}
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      cookie: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis()
    };

    next = vi.fn();
  });

  describe('POST /api/auth/register', () => {
    it('debería retornar 400 si falta el email o la contraseña', async () => {
      req.body = { email: '', name: 'Gonzalo', password: '' };

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Datos inválidos',
          details: expect.arrayContaining([
            { field: 'email', message: 'El email es obligatorio' },
            { field: 'password', message: 'La contraseña es obligatoria' }
          ])
        })
      );
    });

    it('debería retornar 400 si falta el nombre', async () => {
      req.body = { email: 'test@example.com', name: '', password: 'password123' };

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Datos inválidos',
          details: expect.arrayContaining([{ field: 'name', message: 'El nombre es obligatorio' }])
        })
      );
    });

    it('debería retornar 400 si el email no es válido o la contraseña tiene menos de 6 caracteres', async () => {
      req.body = { email: 'invalido-email', name: 'Gonzalo', password: '123' };

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Datos inválidos',
          details: expect.arrayContaining([
            { field: 'email', message: 'El formato del email es inválido' },
            { field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' }
          ])
        })
      );
    });

    it('debería retornar 400 si el nombre es demasiado corto', async () => {
      req.body = { email: 'test@example.com', name: 'G', password: 'password123' };

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Datos inválidos',
          details: expect.arrayContaining([
            { field: 'name', message: 'El nombre debe tener al menos 2 caracteres' }
          ])
        })
      );
    });

    it('debería retornar 409 si el email ya está registrado', async () => {
      req.body = { email: 'test@example.com', name: 'Gonzalo', password: 'password123' };
      userService.getUserByEmail.mockResolvedValue({ id: 1, email: 'test@example.com' });

      await register(req, res, next);

      expect(userService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Email ya registrado'
        })
      );
    });

    it('debería registrar un nuevo usuario con éxito y retornar 201', async () => {
      req.body = { email: 'new@example.com', name: 'Gonzalo', password: 'password123' };
      userService.getUserByEmail.mockResolvedValue(null);
      userService.createUser.mockResolvedValue({
        id: 2,
        email: 'new@example.com',
        name: 'Gonzalo',
        password: 'hashedpassword',
        role: { name: 'usuario' }
      });

      await register(req, res, next);

      expect(userService.createUser).toHaveBeenCalledWith({
        email: 'new@example.com',
        name: 'Gonzalo',
        password: 'password123'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      // Debe excluir la contraseña de la respuesta
      expect(res.json).toHaveBeenCalledWith({
        id: 2,
        email: 'new@example.com',
        name: 'Gonzalo',
        role: 'usuario'
      });
    });

    it('debería delegar el error a next si ocurre una excepción', async () => {
      req.body = { email: 'test@example.com', name: 'Gonzalo', password: 'password123' };
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
        error: 'Credenciales inválidas',
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
        error: 'Credenciales inválidas',
        message: 'El email o la contraseña son incorrectos'
      });
    });

    it('debería iniciar sesión con éxito y retornar el token JWT y status 200, inyectando la cookie de refresh', async () => {
      req.body = { email: 'test@example.com', password: 'correctpassword' };
      userService.getUserByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
        role: { name: 'admin' }
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mocked-jwt-token');
      prisma.refreshToken.create.mockResolvedValue({
        token: 'mocked-refresh-token'
      });

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          email: 'test@example.com',
          role: 'admin'
        }),
        expect.any(String),
        expect.objectContaining({ expiresIn: '15m' }) // Debe expirar en 15m ahora
      );
      expect(prisma.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 1,
            token: expect.any(String),
            expiresAt: expect.any(Date)
          })
        })
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: expect.any(Boolean),
          sameSite: 'strict',
          maxAge: expect.any(Number)
        })
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

  describe('POST /api/auth/refresh', () => {
    it('debería retornar 401 si no se presenta la cookie refreshToken', async () => {
      req.cookies = {}; // Sin cookies

      await refresh(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'No autorizado'
        })
      );
    });

    it('debería retornar 401 si el refresh token no existe en base de datos', async () => {
      req.cookies = { refreshToken: 'invalid-token' };
      prisma.refreshToken.findUnique.mockResolvedValue(null); // No existe en BD

      await refresh(req, res, next);

      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: 'invalid-token' },
        include: { user: { include: { role: true } } }
      });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'No autorizado'
        })
      );
    });

    it('debería retornar 401 si el refresh token está expirado', async () => {
      req.cookies = { refreshToken: 'expired-token' };
      prisma.refreshToken.findUnique.mockResolvedValue({
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1000), // Expirado hace un segundo
        revokedAt: null,
        user: { id: 1, email: 'test@example.com', role: { name: 'usuario' } }
      });

      await refresh(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('debería retornar 401 si el refresh token está revocado', async () => {
      req.cookies = { refreshToken: 'revoked-token' };
      prisma.refreshToken.findUnique.mockResolvedValue({
        token: 'revoked-token',
        expiresAt: new Date(Date.now() + 100000), // Válido en fecha
        revokedAt: new Date(), // Revocado ahora
        user: { id: 1, email: 'test@example.com', role: { name: 'usuario' } }
      });

      await refresh(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('debería retornar 200 y el nuevo access token si el refresh token es válido', async () => {
      req.cookies = { refreshToken: 'valid-token' };
      prisma.refreshToken.findUnique.mockResolvedValue({
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
        user: { id: 1, email: 'test@example.com', role: { name: 'usuario' } }
      });
      jwt.sign.mockReturnValue('new-mocked-jwt-token');

      await refresh(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 1, role: 'usuario' }),
        expect.any(String),
        expect.objectContaining({ expiresIn: '15m' })
      );
      expect(res.json).toHaveBeenCalledWith({
        token: 'new-mocked-jwt-token'
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('debería limpiar la cookie y revocar el token en base de datos', async () => {
      req.cookies = { refreshToken: 'active-token' };
      prisma.refreshToken.update.mockResolvedValue({});

      await logout(req, res, next);

      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { token: 'active-token' },
          data: expect.objectContaining({
            revokedAt: expect.any(Date)
          })
        })
      );
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('GET /api/auth/me', () => {
    it('debería retornar 200 y el perfil del usuario autenticado', async () => {
      req.user = { id: 1, email: 'test@example.com', role: 'usuario' };

      await getMe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        email: 'test@example.com',
        role: 'usuario'
      });
    });

    it('debería delegar el error a next si ocurre una excepción', async () => {
      const error = new Error('Status crash');
      res.status.mockImplementationOnce(() => {
        throw error;
      });

      await getMe(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('AUTH_CONFIG Constants', () => {
    it('debería tener las propiedades correctas de cookies y tokens', () => {
      expect(AUTH_CONFIG).toBeDefined();
      expect(AUTH_CONFIG.COOKIE_NAME).toBe('refreshToken');
      expect(AUTH_CONFIG.ACCESS_TOKEN_EXPIRY).toBe('15m');
      expect(AUTH_CONFIG.REFRESH_TOKEN_EXPIRY).toBe('7d');
      expect(AUTH_CONFIG.COOKIE_MAX_AGE).toBe(7 * 24 * 60 * 60 * 1000);
    });
  });
});
