import i18next from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const es = require('../locales/errors/es.json');
const en = require('../locales/errors/en.json');

export const ERROR_KEYS = {
  UNAUTHORIZED_HEADER: 'UNAUTHORIZED_HEADER',
  TOKEN_INVALID: 'TOKEN_INVALID',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  FORBIDDEN_ROLE: 'FORBIDDEN_ROLE',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  INVALID_DATA: 'INVALID_DATA',
  EMAIL_REQUIRED: 'EMAIL_REQUIRED',
  NAME_REQUIRED: 'NAME_REQUIRED',
  PASSWORD_REQUIRED: 'PASSWORD_REQUIRED',
  EMAIL_INVALID_FORMAT: 'EMAIL_INVALID_FORMAT',
  PASSWORD_TOO_SHORT: 'PASSWORD_TOO_SHORT',
  NAME_TOO_SHORT: 'NAME_TOO_SHORT',
  NAME_TOO_LONG: 'NAME_TOO_LONG',
  EMAIL_ALREADY_REGISTERED: 'EMAIL_ALREADY_REGISTERED',
  INCOMPLETE_CREDENTIALS: 'INCOMPLETE_CREDENTIALS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_CARD_ID: 'INVALID_CARD_ID',
  CARD_NOT_FOUND: 'CARD_NOT_FOUND',
  CARD_TYPE_NOT_FOUND: 'CARD_TYPE_NOT_FOUND',
  RARITY_NOT_FOUND: 'RARITY_NOT_FOUND',
  CARD_DELETED: 'CARD_DELETED',
  FAVORITE_ADDED: 'FAVORITE_ADDED',
  FAVORITE_DELETED: 'FAVORITE_DELETED',
  FAVORITE_ALREADY_EXISTS: 'FAVORITE_ALREADY_EXISTS',
  FAVORITE_NOT_FOUND: 'FAVORITE_NOT_FOUND',
  // Card validation error keys
  INVALID_COST: 'INVALID_COST',
  INVALID_ATK: 'INVALID_ATK',
  INVALID_DEF: 'INVALID_DEF',
  INVALID_IMAGE: 'INVALID_IMAGE',
  INVALID_TYPE_ID: 'INVALID_TYPE_ID',
  INVALID_RARITY_ID: 'INVALID_RARITY_ID',
  TRANSLATIONS_REQUIRED: 'TRANSLATIONS_REQUIRED',
  TRANSLATIONS_NOT_ARRAY: 'TRANSLATIONS_NOT_ARRAY',
  TRANSLATIONS_EMPTY: 'TRANSLATIONS_EMPTY',
  TRANSLATION_LANGUAGE_INVALID: 'TRANSLATION_LANGUAGE_INVALID',
  TRANSLATION_NAME_INVALID: 'TRANSLATION_NAME_INVALID',
  TRANSLATION_DESCRIPTION_INVALID: 'TRANSLATION_DESCRIPTION_INVALID',
  BODY_REQUIRED: 'BODY_REQUIRED',
  INVALID_LANGUAGE: 'INVALID_LANGUAGE',
  INVALID_DARK_MODE: 'INVALID_DARK_MODE',
  CURRENT_PASSWORD_REQUIRED: 'CURRENT_PASSWORD_REQUIRED',
  NEW_PASSWORD_REQUIRED: 'NEW_PASSWORD_REQUIRED',
  INVALID_CURRENT_PASSWORD: 'INVALID_CURRENT_PASSWORD',
  HEALTH_DESCRIPTION: 'HEALTH_DESCRIPTION'
};

i18next.use(i18nextMiddleware.LanguageDetector).init({
  preload: ['es', 'en'],
  fallbackLng: 'es',
  detection: {
    order: ['querystring', 'header'],
    lookupQuerystring: 'lang'
  },
  resources: {
    es: { translation: es },
    en: { translation: en }
  },
  interpolation: {
    escapeValue: false
  }
});

export const i18nMiddleware = i18nextMiddleware.handle(i18next);

/**
 * Traduce una clave de error al idioma seleccionado.
 *
 * @param {string} key - Clave del error (de ERROR_KEYS).
 * @param {"es" | "en"} lang - Idioma seleccionado ("es" por defecto).
 * @param {Array} args - Argumentos para mensajes dinámicos (funciones).
 * @returns {any} La traducción (string u objeto).
 */
export function translate(key, lang = 'es', ...args) {
  const translation = i18next.t(key, { lng: lang, returnObjects: true, role: args[0] });

  return translation;
}
