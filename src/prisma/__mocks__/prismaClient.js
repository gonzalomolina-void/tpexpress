import { vi } from 'vitest';

/**
 * Mock completo para PrismaClient en entorno de pruebas unitarias con Vitest.
 */
const prismaMock = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  favorite: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
  },
  card: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  cardType: {
    findUnique: vi.fn(),
  },
  rarity: {
    findUnique: vi.fn(),
  },
  cardTranslation: {
    upsert: vi.fn(),
  },
  $transaction: vi.fn(async (callback) => {
    // Si se pasa una función callback (función transaccional), la ejecutamos pasándole el mock
    if (typeof callback === 'function') {
      return callback(prismaMock);
    }
    return [];
  }),
};

export default prismaMock;
