import { createRequire } from 'module';

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
    res.status(200).json({
      status: 'ok',
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description
    });
  } catch (error) {
    next(error);
  }
}
