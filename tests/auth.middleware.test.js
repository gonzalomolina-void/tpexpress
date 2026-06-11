import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireRole } from '../src/middlewares/auth.js';
import { ROLES } from '../src/constants/auth.constants.js';

describe('Auth Middleware - requireRole Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    next = vi.fn();
  });

  it('debería retornar 401 si req.user no existe (autenticación previa requerida)', () => {
    req.user = undefined;

    const middleware = requireRole(ROLES.ADMIN);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'No autorizado',
      message: 'Se requiere autenticación previa para verificar el rol'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería retornar 403 si el rol del usuario no coincide con el requerido', () => {
    req.user = {
      id: 1,
      email: 'user@example.com',
      role: ROLES.USER
    };

    const middleware = requireRole(ROLES.ADMIN);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Forbidden',
      message: 'Acceso denegado: se requiere el rol de admin para realizar esta operación'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería llamar a next si el rol del usuario coincide con el requerido', () => {
    req.user = {
      id: 2,
      email: 'admin@example.com',
      role: ROLES.ADMIN
    };

    const middleware = requireRole(ROLES.ADMIN);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
