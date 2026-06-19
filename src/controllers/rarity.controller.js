import * as rarityService from '../services/rarity.service.js';
import { getLanguage } from '../utils/i18n.js';

/**
 * Endpoint para obtener el listado de rarezas de cartas.
 * Soporta internacionalización.
 *
 * @type {import('express').RequestHandler}
 */
export async function getAllRarities(req, res, next) {
  try {
    const lang = getLanguage(req);
    const rarities = await rarityService.getRarities({ lang });
    res.status(200).json(rarities);
  } catch (error) {
    next(error);
  }
}
