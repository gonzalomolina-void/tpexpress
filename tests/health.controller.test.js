import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHealth } from '../src/controllers/health.controller.js';

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
    it('debería retornar estado 200 y mensaje de ok', async () => {
      await getHealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'ok',
        message: 'API funcionando correctamente'
      });
    });
  });
});
