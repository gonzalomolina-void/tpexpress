import * as typeService from '../services/type.service.js';
import { getLanguage } from '../utils/i18n.js';

/**
 * Endpoint para obtener el listado de tipos de cartas.
 * Soporta internacionalización.
 *
 * @type {import('express').RequestHandler}
 */
export async function getAllTypes(req, res, next) {
  try {
    const lang = getLanguage(req);
    const types = await typeService.getTypes({ lang });
    res.status(200).json(types);
  } catch (error) {
    next(error);
  }
}
