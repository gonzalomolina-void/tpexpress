import { createRequire } from 'module';
import prisma from '../prisma/prismaClient.js';

const require = createRequire(import.meta.url);
const packageJson = require('../../package.json');

/**
 * Controlador de salud/diagnóstico de la API.
 * GET /api/health
 *
 * @type {import('express').RequestHandler}
 */
export async function getHealth(req, res, next) {
  try {
    let databaseStatus = 'ok';
    
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      databaseStatus = 'error';
    }

    const isHealthy = databaseStatus === 'ok';

    return res.status(isHealthy ? 200 : 500).json({
      status: isHealthy ? 'ok' : 'error',
      database: databaseStatus,
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description
    });
  } catch (error) {
    next(error);
  }
}
