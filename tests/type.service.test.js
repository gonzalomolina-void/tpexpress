import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTypes } from '../src/services/type.service.js';
import prisma from '../src/prisma/prismaClient.js';

// Mockear prismaClient
vi.mock('../src/prisma/prismaClient.js');

describe('Type Service - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDbTypes = [
    {
      id: 1,
      code: 'creature',
      translations: [
        { language: 'es', name: 'Criatura' },
        { language: 'en', name: 'Creature' }
      ]
    },
    {
      id: 2,
      code: 'spell',
      translations: [
        { language: 'es', name: 'Hechizo' },
        { language: 'en', name: 'Spell' }
      ]
    },
    {
      id: 3,
      code: 'artifact',
      translations: [
        { language: 'es', name: 'Artefacto' } // No english translation to test fallback
      ]
    }
  ];

  it('debería retornar todos los tipos traducidos al español por defecto o si se solicita "es"', async () => {
    prisma.cardType.findMany.mockResolvedValue(mockDbTypes);

    const result = await getTypes({ lang: 'es' });

    expect(prisma.cardType.findMany).toHaveBeenCalledWith({
      include: { translations: true },
      orderBy: { id: 'asc' }
    });
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      id: 1,
      code: 'creature',
      name: 'Criatura',
      labelKey: 'card.types.creature'
    });
    expect(result[2]).toEqual({
      id: 3,
      code: 'artifact',
      name: 'Artefacto',
      labelKey: 'card.types.artifact'
    });
  });

  it('debería retornar todos los tipos traducidos al inglés si se solicita "en", con fallback a "es" si no existe traducción', async () => {
    prisma.cardType.findMany.mockResolvedValue(mockDbTypes);

    const result = await getTypes({ lang: 'en' });

    expect(result).toHaveLength(3);
    // Traducido al inglés
    expect(result[0]).toEqual({
      id: 1,
      code: 'creature',
      name: 'Creature',
      labelKey: 'card.types.creature'
    });
    // Fallback a español porque artifact no tiene traducción al inglés
    expect(result[2]).toEqual({
      id: 3,
      code: 'artifact',
      name: 'Artefacto',
      labelKey: 'card.types.artifact'
    });
  });

  it('debería propagar errores si prisma.cardType.findMany arroja un error', async () => {
    const dbError = new Error('Database connection failed');
    prisma.cardType.findMany.mockRejectedValue(dbError);

    await expect(getTypes({ lang: 'es' })).rejects.toThrow('Database connection failed');
  });
});
