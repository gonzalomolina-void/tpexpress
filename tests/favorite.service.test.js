import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFavorites, addFavorite, removeFavorite } from '../src/services/favorite.service.js';
import prisma from '../src/prisma/prismaClient.js';

// Esto auto-mockea importando desde src/prisma/__mocks__/prismaClient.js
vi.mock('../src/prisma/prismaClient.js');

describe('Favorite Service - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFavorites', () => {
    it('debería retornar los favoritos del usuario llamando a prisma.favorite.findMany', async () => {
      const mockFavoritesList = [
        { userId: 1, cardId: 10, card: { id: 10, cost: 3 } },
        { userId: 1, cardId: 20, card: { id: 20, cost: 5 } }
      ];
      prisma.favorite.findMany.mockResolvedValue(mockFavoritesList);

      const result = await getFavorites(1);

      expect(prisma.favorite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1 },
          include: expect.any(Object),
          orderBy: { createdAt: 'desc' }
        })
      );
      expect(result).toEqual(mockFavoritesList);
    });
  });

  describe('addFavorite', () => {
    it('debería agregar una carta a favoritos de forma idempotente con prisma.favorite.upsert', async () => {
      const mockResult = { userId: 1, cardId: 10 };
      prisma.favorite.upsert.mockResolvedValue(mockResult);

      const result = await addFavorite(1, 10);

      expect(prisma.favorite.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_cardId: { userId: 1, cardId: 10 }
          },
          create: { userId: 1, cardId: 10 },
          update: {} // No-op
        })
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('removeFavorite', () => {
    it('debería eliminar una carta de favoritos con prisma.favorite.delete', async () => {
      const mockDeleted = { userId: 1, cardId: 10 };
      prisma.favorite.delete.mockResolvedValue(mockDeleted);

      const result = await removeFavorite(1, 10);

      expect(prisma.favorite.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_cardId: { userId: 1, cardId: 10 }
          }
        })
      );
      expect(result).toEqual(mockDeleted);
    });

    it('debería retornar null si la carta no estaba en favoritos (Prisma retorna código P2025)', async () => {
      const error = new Error('Record not found');
      error.code = 'P2025';
      prisma.favorite.delete.mockRejectedValue(error);

      const result = await removeFavorite(1, 10);

      expect(prisma.favorite.delete).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('debería relanzar el error si ocurre otra excepción distinta de P2025', async () => {
      const dbError = new Error('Database connection lost');
      dbError.code = 'P2002'; // Código diferente
      prisma.favorite.delete.mockRejectedValue(dbError);

      await expect(removeFavorite(1, 10)).rejects.toThrow('Database connection lost');
    });
  });
});
