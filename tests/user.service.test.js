import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser, getUserByEmail, getUserById } from '../src/services/user.service.js';
import prisma from '../src/prisma/prismaClient.js';

vi.mock('../src/prisma/prismaClient.js');

describe('User Service - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('debería crear un usuario con su perfil anidado (profile: { create: {} })', async () => {
      const mockCreatedUser = {
        id: 1,
        email: 'newuser@example.com',
        name: 'New User',
        roleId: 2,
        role: { id: 2, name: 'usuario' },
        profile: { id: 1, userId: 1, darkMode: false, language: 'es' }
      };

      prisma.user.create.mockResolvedValue(mockCreatedUser);

      const result = await createUser({
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123'
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'newuser@example.com',
          name: 'New User',
          password: expect.any(String),
          role: {
            connect: { name: 'usuario' }
          },
          profile: {
            create: {}
          }
        },
        include: {
          role: true,
          profile: true
        }
      });

      expect(result).toEqual(mockCreatedUser);
    });
  });

  describe('getUserByEmail', () => {
    it('debería retornar el usuario correspondiente al email incluyendo su perfil', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        roleId: 2,
        role: { id: 2, name: 'usuario' },
        profile: { id: 1, userId: 1, darkMode: false, language: 'es' }
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await getUserByEmail('test@example.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { role: true, profile: true }
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserById', () => {
    it('debería retornar el usuario correspondiente al ID incluyendo su perfil', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        roleId: 2,
        role: { id: 2, name: 'usuario' },
        profile: { id: 1, userId: 1, darkMode: false, language: 'es' }
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await getUserById(1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { role: true, profile: true }
      });
      expect(result).toEqual(mockUser);
    });
  });
});
