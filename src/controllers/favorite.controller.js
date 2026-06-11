import * as favoriteService from '../services/favorite.service.js';
import * as cardService from '../services/card.service.js';
import { getLanguage, mapCardToLang } from '../utils/i18n.js';
import { ERROR_KEYS, translate } from '../utils/errors.i18n.js';

/**
 * Obtiene el listado de favoritos del usuario autenticado.
 * 
 * @type {import('express').RequestHandler}
 */
export async function getFavorites(req, res, next) {
  try {
    const userId = req.user.id;
    const lang = getLanguage(req);

    const favorites = await favoriteService.getFavorites(userId);
    
    // Mapear y aplanar la estructura de i18n para cada carta favorita
    const formattedCards = favorites.map(fav => mapCardToLang(fav.card, lang));

    res.status(200).json(formattedCards);
  } catch (error) {
    next(error);
  }
}

/**
 * Agrega una carta al listado de favoritos del usuario autenticado.
 * 
 * @type {import('express').RequestHandler}
 */
export async function addFavorite(req, res, next) {
  try {
    const userId = req.user.id;
    const cardId = parseInt(req.body.cardId, 10);
    const lang = getLanguage(req);

    // 1. Validar que el ID sea numérico
    if (isNaN(cardId)) {
      return res.status(400).json({
        error: translate(ERROR_KEYS.INVALID_DATA, lang),
        details: [{ field: 'cardId', message: translate(ERROR_KEYS.INVALID_CARD_ID, lang) }]
      });
    }

    // 2. Validar existencia de la carta en base de datos
    const card = await cardService.getCardById(cardId);
    if (!card) {
      const err = translate(ERROR_KEYS.CARD_NOT_FOUND, lang);
      return res.status(404).json({
        error: err.error,
        message: err.message
      });
    }

    // 3. Crear favorito (idempotente)
    await favoriteService.addFavorite(userId, cardId);

    res.status(201).json({
      message: translate(ERROR_KEYS.FAVORITE_ADDED, lang)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remueve una carta del listado de favoritos del usuario autenticado.
 * 
 * @type {import('express').RequestHandler}
 */
export async function removeFavorite(req, res, next) {
  try {
    const userId = req.user.id;
    const cardId = parseInt(req.params.cardId, 10);
    const lang = getLanguage(req);

    // 1. Validar que el ID de la carta sea numérico
    if (isNaN(cardId)) {
      return res.status(400).json({
        error: translate(ERROR_KEYS.INVALID_DATA, lang),
        details: [{ field: 'cardId', message: translate(ERROR_KEYS.INVALID_CARD_ID, lang) }]
      });
    }

    // 2. Borrar favorito de base de datos
    await favoriteService.removeFavorite(userId, cardId);

    // Retorna 200 OK según los criterios de aceptación
    res.status(200).json({
      message: translate(ERROR_KEYS.FAVORITE_DELETED, lang)
    });
  } catch (error) {
    next(error);
  }
}
