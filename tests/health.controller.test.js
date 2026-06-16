import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'module';
import { getHealth } from '../src/controllers/health.controller.js';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

describe('Health Controller - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    next = vi.fn();
  });

  describe('getHealth', () => {
    it('debería retornar estado 200 y la metadata de la API desde package.json', async () => {
      await getHealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'ok',
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description
      });
    });
  });
});
