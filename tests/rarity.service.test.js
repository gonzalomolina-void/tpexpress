import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRarities } from '../src/services/rarity.service.js';
import prisma from '../src/prisma/prismaClient.js';

// Mockear prismaClient
vi.mock('../src/prisma/prismaClient.js');

describe('Rarity Service - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDbRarities = [
    {
      id: 1,
      code: 'poor',
      translations: [
        { language: 'es', name: 'Pobre' },
        { language: 'en', name: 'Poor' }
      ]
    },
    {
      id: 2,
      code: 'common',
      translations: [
        { language: 'es', name: 'Común' },
        { language: 'en', name: 'Common' }
      ]
    },
    {
      id: 3,
      code: 'uncommon',
      translations: [
        { language: 'es', name: 'Poco Común' } // No english translation to test fallback
      ]
    }
  ];

  it('debería retornar todas las rarezas traducidas al español por defecto o si se solicita "es"', async () => {
    prisma.rarity.findMany.mockResolvedValue(mockDbRarities);

    const result = await getRarities({ lang: 'es' });

    expect(prisma.rarity.findMany).toHaveBeenCalledWith({
      include: { translations: true },
      orderBy: { id: 'asc' }
    });
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      id: 1,
      code: 'poor',
      name: 'Pobre',
      labelKey: 'card.rarities.poor'
    });
    expect(result[2]).toEqual({
      id: 3,
      code: 'uncommon',
      name: 'Poco Común',
      labelKey: 'card.rarities.uncommon'
    });
  });

  it('debería retornar todas las rarezas traducidas al inglés si se solicita "en", con fallback a "es" si no existe traducción', async () => {
    prisma.rarity.findMany.mockResolvedValue(mockDbRarities);

    const result = await getRarities({ lang: 'en' });

    expect(result).toHaveLength(3);
    // Traducido al inglés
    expect(result[0]).toEqual({
      id: 1,
      code: 'poor',
      name: 'Poor',
      labelKey: 'card.rarities.poor'
    });
    // Fallback a español porque uncommon no tiene traducción al inglés
    expect(result[2]).toEqual({
      id: 3,
      code: 'uncommon',
      name: 'Poco Común',
      labelKey: 'card.rarities.uncommon'
    });
  });

  it('debería propagar errores si prisma.rarity.findMany arroja un error', async () => {
    const dbError = new Error('Database connection failed');
    prisma.rarity.findMany.mockRejectedValue(dbError);

    await expect(getRarities({ lang: 'es' })).rejects.toThrow('Database connection failed');
  });
});
