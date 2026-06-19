import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCards } from '../src/services/card.service.js';
import prisma from '../src/prisma/prismaClient.js';

// Mockear prismaClient
vi.mock('../src/prisma/prismaClient.js', () => ({
  default: {
    card: {
      findMany: vi.fn(),
      count: vi.fn()
    }
  }
}));

describe('Card Service - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDbCards = [
    {
      id: 1,
      cost: 3,
      atk: 4,
      def: 5,
      image: '/cards/kaelen.png',
      translations: [
        { language: 'es', name: 'Sir Kaelen', description: 'Un noble caballero...' },
        { language: 'en', name: 'Sir Kaelen', description: 'A noble knight...' }
      ]
    }
  ];

  it('debería consultar las cartas sin filtros y con paginación por defecto', async () => {
    prisma.card.findMany.mockResolvedValue(mockDbCards);
    prisma.card.count.mockResolvedValue(1);

    const result = await getCards({
      page: 1,
      limit: 10,
      search: undefined,
      type: undefined,
      rarity: undefined,
      lang: 'es'
    });

    expect(prisma.card.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
      include: expect.any(Object),
      orderBy: { id: 'asc' }
    });
    expect(prisma.card.count).toHaveBeenCalledWith({ where: {} });
    expect(result).toEqual({ cards: mockDbCards, totalCount: 1 });
  });

  it('debería generar la cláusula where correcta con operador OR para buscar por nombre o descripción', async () => {
    prisma.card.findMany.mockResolvedValue(mockDbCards);
    prisma.card.count.mockResolvedValue(1);

    const result = await getCards({
      page: 1,
      limit: 10,
      search: 'kaelen',
      type: undefined,
      rarity: undefined,
      lang: 'en'
    });

    expect(prisma.card.findMany).toHaveBeenCalledWith({
      where: {
        translations: {
          some: {
            language: 'en',
            OR: [
              { name: { contains: 'kaelen', mode: 'insensitive' } },
              { description: { contains: 'kaelen', mode: 'insensitive' } }
            ]
          }
        }
      },
      skip: 0,
      take: 10,
      include: expect.any(Object),
      orderBy: { id: 'asc' }
    });
    expect(result.totalCount).toBe(1);
  });

  it('debería propagar errores si prisma.card.findMany falla', async () => {
    const dbError = new Error('Prisma error');
    prisma.card.findMany.mockRejectedValue(dbError);

    await expect(
      getCards({
        page: 1,
        limit: 10,
        search: undefined,
        type: undefined,
        rarity: undefined,
        lang: 'es'
      })
    ).rejects.toThrow('Prisma error');
  });
});
