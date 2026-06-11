import * as cardService from '../services/card.service.js';
import { getLanguage, mapCardToLang } from '../utils/i18n.js';
import { validateCard } from '../validations/card.validation.js';

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
      page = (page && page > 0) ? page : 1;
      limit = (limit && limit > 0) ? limit : 10; // 10 elementos por página por defecto si se omite limit
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
    if (isNaN(id)) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: [{ field: 'id', message: 'El ID de la carta debe ser un número entero válido' }]
      });
    }

    // Resolver el idioma del request
    const lang = getLanguage(req);

    // Obtener la carta
    const card = await cardService.getCardById(id);

    // Si no existe, retornar 404
    if (!card) {
      return res.status(404).json({
        error: 'Recurso no encontrado'
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
    // 1. Validar el body de forma manual
    const validationErrors = validateCard(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: validationErrors
      });
    }

    const { typeId, rarityId } = req.body;

    // 2. Validar referencialidad de typeId y rarityId
    const typeExists = await cardService.checkTypeExists(typeId);
    if (!typeExists) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: [{ field: 'typeId', message: 'El tipo de carta indicado no existe' }]
      });
    }

    const rarityExists = await cardService.checkRarityExists(rarityId);
    if (!rarityExists) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: [{ field: 'rarityId', message: 'La rareza indicada no existe' }]
      });
    }

    // 3. Crear la carta
    const newCard = await cardService.createCard(req.body);

    // 4. Retornar en el idioma adecuado, aplanada
    const lang = getLanguage(req);
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
    if (isNaN(id)) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: [{ field: 'id', message: 'El ID de la carta debe ser un número entero válido' }]
      });
    }

    // 1. Validar el body de forma manual
    const validationErrors = validateCard(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: validationErrors
      });
    }

    const { typeId, rarityId } = req.body;

    // 2. Validar referencialidad de typeId y rarityId
    const typeExists = await cardService.checkTypeExists(typeId);
    if (!typeExists) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: [{ field: 'typeId', message: 'El tipo de carta indicado no existe' }]
      });
    }

    const rarityExists = await cardService.checkRarityExists(rarityId);
    if (!rarityExists) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: [{ field: 'rarityId', message: 'La rareza indicada no existe' }]
      });
    }

    // 3. Actualizar la carta
    const updatedCard = await cardService.updateCard(id, req.body);

    // 4. Si la carta no existe, retornar 404
    if (!updatedCard) {
      return res.status(404).json({
        error: 'Recurso no encontrado'
      });
    }

    // 5. Retornar en el idioma adecuado, aplanada
    const lang = getLanguage(req);
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
    if (isNaN(id)) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: [{ field: 'id', message: 'El ID de la carta debe ser un número entero válido' }]
      });
    }

    // 1. Eliminar la carta
    const deletedCard = await cardService.deleteCard(id);

    // 2. Si la carta no existe, retornar 404
    if (!deletedCard) {
      return res.status(404).json({
        error: 'Recurso no encontrado'
      });
    }

    // 3. Retornar 200 OK con mensaje de éxito (conforme al formato de favoritos)
    res.status(200).json({
      message: 'Carta eliminada correctamente'
    });
  } catch (error) {
    next(error);
  }
}

