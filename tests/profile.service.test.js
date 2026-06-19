import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProfileByUserId, updateProfile } from '../src/services/profile.service.js';
import prisma from '../src/prisma/prismaClient.js';

vi.mock('../src/prisma/prismaClient.js');

describe('Profile Service - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfileByUserId', () => {
    it('debería retornar el perfil correspondiente al userId', async () => {
      const mockProfile = {
        id: 1,
        userId: 10,
        darkMode: false,
        language: 'es'
      };
      prisma.profile.findUnique.mockResolvedValue(mockProfile);

      const result = await getProfileByUserId(10);

      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: 10 }
      });
      expect(result).toEqual(mockProfile);
    });

    it('debería retornar null si el perfil no existe', async () => {
      prisma.profile.findUnique.mockResolvedValue(null);

      const result = await getProfileByUserId(99);

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('debería actualizar y retornar el perfil correspondiente al userId', async () => {
      const updatedProfile = {
        id: 1,
        userId: 10,
        darkMode: true,
        language: 'en'
      };
      prisma.profile.update.mockResolvedValue(updatedProfile);

      const result = await updateProfile(10, { darkMode: true, language: 'en' });

      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { userId: 10 },
        data: { darkMode: true, language: 'en' }
      });
      expect(result).toEqual(updatedProfile);
    });

    it('debería permitir actualizar parcialmente solo el campo darkMode', async () => {
      const updatedProfile = {
        id: 1,
        userId: 10,
        darkMode: false,
        language: 'en'
      };
      prisma.profile.update.mockResolvedValue(updatedProfile);

      const result = await updateProfile(10, { darkMode: false });

      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { userId: 10 },
        data: { darkMode: false }
      });
      expect(result).toEqual(updatedProfile);
    });
  });
});
