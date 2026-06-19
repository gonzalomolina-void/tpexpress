import * as cardService from '../services/card.service.js';
import { getLanguage, mapCardToLang, mapCardForEdit } from '../utils/i18n.js';
import { validateCard } from '../validations/card.validation.js';
import { ERROR_KEYS, translate } from '../utils/errors.i18n.js';

/**
 * Endpoint para obtener el listado de cartas.
 * Soporta internacionalización híbrida y paginación opcional emulando mockapi.io.
 *
 * @type {import('express').RequestHandler}
 */
export async function getAllCards(req, res, next) {
  try {
    let page = req.query.page ? parseInt(req.query.page, 10) : null;
    let limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    const { search, type, rarity } = req.query;

    let isPaging = false;

    // Si se pasa 'page' o 'limit', activamos la paginación.
    if (page !== null || limit !== null) {
      isPaging = true;
      page = page && page > 0 ? page : 1;
      limit = limit && limit > 0 ? limit : 10; // 10 elementos por página por defecto si se omite limit
    }

    // Resolver el idioma del request
    const lang = getLanguage(req);

    // Obtener los datos del servicio
    const { cards, totalCount } = await cardService.getCards({
      page: isPaging ? page : null,
      limit: isPaging ? limit : null,
      search,
      type,
      rarity,
      lang
    });

    // Si hay paginación, seteamos el header de conteo total
    if (isPaging) {
      res.setHeader('X-Total-Count', totalCount);
      // Exponemos la cabecera para que sea legible en peticiones CORS desde el frontend
      res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
    }

    // Mapear y aplanar las cartas según el idioma
    const formattedCards = cards.map(card => mapCardToLang(card, lang));

    // Retornar array JSON plano
    res.status(200).json(formattedCards);
  } catch (error) {
    next(error);
  }
}

/**
 * Endpoint para obtener el detalle de una carta por ID.
 * Soporta internacionalización híbrida.
 *
 * @type {import('express').RequestHandler}
 */
export async function getCardById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const lang = getLanguage(req);

    if (isNaN(id)) {
      return res.status(400).json({
        error: translate(ERROR_KEYS.INVALID_DATA, lang),
        details: [{ field: 'id', message: translate(ERROR_KEYS.INVALID_CARD_ID, lang) }]
      });
    }

    // Obtener la carta
    const card = await cardService.getCardById(id);

    // Si no existe, retornar 404
    if (!card) {
      const err = translate(ERROR_KEYS.CARD_NOT_FOUND, lang);
      return res.status(404).json({
        error: err.error,
        message: err.message
      });
    }

    // Mapear y aplanar la carta individual
    const formattedCard = mapCardToLang(card, lang);

    res.status(200).json(formattedCard);
  } catch (error) {
    next(error);
  }
}

/**
 * Endpoint para crear una nueva carta.
 * POST /api/cards
 *
 * @type {import('express').RequestHandler}
 */
export async function createCard(req, res, next) {
  try {
    const lang = getLanguage(req);

    // 1. Validar el body de forma manual
    const validationErrors = validateCard(req.body);

    if (validationErrors.length > 0) {
      const details = validationErrors.map(err => ({
        field: err.field,
        message: translate(err.errorKey, lang)
      }));
      return res.status(400).json({
        error: translate(ERROR_KEYS.INVALID_DATA, lang),
        details
      });
    }

    const { typeId, rarityId } = req.body;

    // 2. Validar referencialidad de typeId y rarityId
    const typeExists = await cardService.checkTypeExists(typeId);

    if (!typeExists) {
      return res.status(400).json({
        error: translate(ERROR_KEYS.INVALID_DATA, lang),
        details: [{ field: 'typeId', message: translate(ERROR_KEYS.CARD_TYPE_NOT_FOUND, lang) }]
      });
    }

    const rarityExists = await cardService.checkRarityExists(rarityId);

    if (!rarityExists) {
      return res.status(400).json({
        error: translate(ERROR_KEYS.INVALID_DATA, lang),
        details: [{ field: 'rarityId', message: translate(ERROR_KEYS.RARITY_NOT_FOUND, lang) }]
      });
    }

    // 3. Crear la carta
    const newCard = await cardService.createCard(req.body);

    // 4. Retornar en el idioma adecuado, aplanada
    const formattedCard = mapCardToLang(newCard, lang);

    res.status(201).json(formattedCard);
  } catch (error) {
    next(error);
  }
}

/**
 * Endpoint para actualizar una carta existente.
 * PUT /api/cards/:id
 *
 * @type {import('express').RequestHandler}
 */
export async function updateCard(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const lang = getLanguage(req);

    if (isNaN(id)) {
      return res.status(400).json({
        error: translate(ERROR_KEYS.INVALID_DATA, lang),
        details: [{ field: 'id', message: translate(ERROR_KEYS.INVALID_CARD_ID, lang) }]
      });
    }

    // 1. Validar el body de forma manual
    const validationErrors = validateCard(req.body);

    if (validationErrors.length > 0) {
      const details = validationErrors.map(err => ({
        field: err.field,
        message: translate(err.errorKey, lang)
      }));
      return res.status(400).json({
        error: translate(ERROR_KEYS.INVALID_DATA, lang),
        details
      });
    }

    const { typeId, rarityId } = req.body;

    // 2. Validar referencialidad de typeId y rarityId
    const typeExists = await cardService.checkTypeExists(typeId);

    if (!typeExists) {
      return res.status(400).json({
        error: translate(ERROR_KEYS.INVALID_DATA, lang),
        details: [{ field: 'typeId', message: translate(ERROR_KEYS.CARD_TYPE_NOT_FOUND, lang) }]
      });
    }

    const rarityExists = await cardService.checkRarityExists(rarityId);

    if (!rarityExists) {
      return res.status(400).json({
        error: translate(ERROR_KEYS.INVALID_DATA, lang),
        details: [{ field: 'rarityId', message: translate(ERROR_KEYS.RARITY_NOT_FOUND, lang) }]
      });
    }

    // 3. Actualizar la carta
    const updatedCard = await cardService.updateCard(id, req.body);

    // 4. Si la carta no existe, retornar 404
    if (!updatedCard) {
      const err = translate(ERROR_KEYS.CARD_NOT_FOUND, lang);
      return res.status(404).json({
        error: err.error,
        message: err.message
      });
    }

    // 5. Retornar en el idioma adecuado, aplanada
    const formattedCard = mapCardToLang(updatedCard, lang);

    res.status(200).json(formattedCard);
  } catch (error) {
    next(error);
  }
}

/**
 * Endpoint para eliminar una carta.
 * DELETE /api/cards/:id
 *
 * @type {import('express').RequestHandler}
 */
export async function deleteCard(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const lang = getLanguage(req);

    if (isNaN(id)) {
      return res.status(400).json({
        error: translate(ERROR_KEYS.INVALID_DATA, lang),
        details: [{ field: 'id', message: translate(ERROR_KEYS.INVALID_CARD_ID, lang) }]
      });
    }

    // 1. Eliminar la carta
    const deletedCard = await cardService.deleteCard(id);

    // 2. Si la carta no existe, retornar 404
    if (!deletedCard) {
      const err = translate(ERROR_KEYS.CARD_NOT_FOUND, lang);
      return res.status(404).json({
        error: err.error,
        message: err.message
      });
    }

    // 3. Retornar 200 OK con mensaje de éxito (conforme al formato de favoritos)
    res.status(200).json({
      message: translate(ERROR_KEYS.CARD_DELETED, lang)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Endpoint para obtener el detalle completo de una carta para su edición (sin aplanar).
 * GET /api/cards/:id/edit
 *
 * @type {import('express').RequestHandler}
 */
export async function getCardForEdit(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const lang = getLanguage(req);

    if (isNaN(id)) {
      return res.status(400).json({
        error: translate(ERROR_KEYS.INVALID_DATA, lang),
        details: [{ field: 'id', message: translate(ERROR_KEYS.INVALID_CARD_ID, lang) }]
      });
    }

    const card = await cardService.getCardById(id);

    if (!card) {
      const err = translate(ERROR_KEYS.CARD_NOT_FOUND, lang);
      return res.status(404).json({
        error: err.error,
        message: err.message
      });
    }

    const formattedCard = mapCardForEdit(card);
    res.status(200).json(formattedCard);
  } catch (error) {
    next(error);
  }
}
