import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'module';
import { getHealth } from '../src/controllers/health.controller.js';
import prisma from '../src/prisma/prismaClient.js';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

vi.mock('../src/prisma/prismaClient.js', () => ({
  default: {
    $queryRaw: vi.fn()
  }
}));

describe('Health Controller - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('getHealth', () => {
    it('debería retornar estado 200 y la metadata de la API cuando la base de datos está activa', async () => {
      prisma.$queryRaw.mockResolvedValueOnce([1]);

      await getHealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'ok',
        database: 'ok',
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description
      });
    });

    it('debería retornar estado 500 y status de error cuando la base de datos no está activa', async () => {
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Connection failed'));

      await getHealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        database: 'error',
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description
      });
    });
  });
});
