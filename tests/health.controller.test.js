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
    it('debería retornar estado 200 y la descripción en español por defecto cuando la base de datos está activa', async () => {
      prisma.$queryRaw.mockResolvedValueOnce([1]);
      req.language = 'es';

      await getHealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'ok',
        database: 'ok',
        name: packageJson.name,
        version: packageJson.version,
        description:
          'API REST oficial para Hexa TCG, proporcionando soporte para gestión de cartas, autenticación de usuarios, favoritos y más, con persistencia en base de datos PostgreSQL mediante Prisma ORM.'
      });
    });

    it('debería retornar la descripción en inglés cuando req.language es en', async () => {
      prisma.$queryRaw.mockResolvedValueOnce([1]);
      req.language = 'en';

      await getHealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'ok',
        database: 'ok',
        name: packageJson.name,
        version: packageJson.version,
        description:
          'Official REST API for Hexa TCG, providing support for card management, user authentication, favorites, and more, with persistence in PostgreSQL database using Prisma ORM.'
      });
    });

    it('debería retornar estado 500 y status de error cuando la base de datos no está activa', async () => {
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Connection failed'));
      req.language = 'es';

      await getHealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        database: 'error',
        name: packageJson.name,
        version: packageJson.version,
        description:
          'API REST oficial para Hexa TCG, proporcionando soporte para gestión de cartas, autenticación de usuarios, favoritos y más, con persistencia en base de datos PostgreSQL mediante Prisma ORM.'
      });
    });
  });
});
