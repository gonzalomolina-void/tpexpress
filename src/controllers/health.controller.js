import { createRequire } from 'module';
import prisma from '../prisma/prismaClient.js';
import { getLanguage } from '../utils/i18n.js';
import { ERROR_KEYS, translate } from '../utils/errors.i18n.js';

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
    const lang = getLanguage(req);
    const description = translate(ERROR_KEYS.HEALTH_DESCRIPTION, lang) || packageJson.description;

    return res.status(isHealthy ? 200 : 500).json({
      status: isHealthy ? 'ok' : 'error',
      database: databaseStatus,
      name: packageJson.name,
      version: packageJson.version,
      description
    });
  } catch (error) {
    next(error);
  }
}
