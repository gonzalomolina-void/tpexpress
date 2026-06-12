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
      message: 'API funcionando correctamente'
    });
  } catch (error) {
    next(error);
  }
}
