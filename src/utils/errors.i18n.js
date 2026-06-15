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
  FAVORITE_DELETED: 'FAVORITE_DELETED'
};

const TRANSLATIONS = {
  es: {
    [ERROR_KEYS.UNAUTHORIZED_HEADER]: {
      error: 'No autorizado',
      message: 'Se requiere un token de autenticación en la cabecera Authorization con formato Bearer <token>'
    },
    [ERROR_KEYS.TOKEN_INVALID]: {
      error: 'Token inválido',
      message: 'El token de autenticación provisto es inválido o ha expirado'
    },
    [ERROR_KEYS.USER_NOT_FOUND]: {
      error: 'Usuario no encontrado',
      message: 'El usuario asociado al token ya no existe en el sistema'
    },
    [ERROR_KEYS.AUTH_REQUIRED]: {
      error: 'No autorizado',
      message: 'Se requiere autenticación previa para verificar el rol'
    },
    [ERROR_KEYS.FORBIDDEN_ROLE]: {
      error: 'Forbidden',
      message: (role) => `Acceso denegado: se requiere el rol de ${role} para realizar esta operación`
    },
    [ERROR_KEYS.INTERNAL_SERVER_ERROR]: {
      error: 'Internal Server Error',
      message: 'Ocurrió un error interno en el servidor'
    },
    [ERROR_KEYS.INVALID_DATA]: 'Datos inválidos',
    [ERROR_KEYS.EMAIL_REQUIRED]: 'El email es obligatorio',
    [ERROR_KEYS.NAME_REQUIRED]: 'El nombre es obligatorio',
    [ERROR_KEYS.PASSWORD_REQUIRED]: 'La contraseña es obligatoria',
    [ERROR_KEYS.EMAIL_INVALID_FORMAT]: 'El formato del email es inválido',
    [ERROR_KEYS.PASSWORD_TOO_SHORT]: 'La contraseña debe tener al menos 6 caracteres',
    [ERROR_KEYS.NAME_TOO_SHORT]: 'El nombre debe tener al menos 2 caracteres',
    [ERROR_KEYS.NAME_TOO_LONG]: 'El nombre no puede superar los 50 caracteres',
    [ERROR_KEYS.EMAIL_ALREADY_REGISTERED]: {
      error: 'Email ya registrado',
      message: 'El email indicado ya se encuentra registrado en el sistema'
    },
    [ERROR_KEYS.INCOMPLETE_CREDENTIALS]: {
      error: 'Credenciales incompletas',
      message: 'Debes proporcionar email y contraseña'
    },
    [ERROR_KEYS.INVALID_CREDENTIALS]: {
      error: 'Credenciales inválidas',
      message: 'El email o la contraseña son incorrectos'
    },
    [ERROR_KEYS.INVALID_CARD_ID]: 'El ID de la carta debe ser un número entero válido',
    [ERROR_KEYS.CARD_NOT_FOUND]: {
      error: 'Recurso no encontrado',
      message: 'La carta solicitada no existe'
    },
    [ERROR_KEYS.CARD_TYPE_NOT_FOUND]: 'El tipo de carta indicado no existe',
    [ERROR_KEYS.RARITY_NOT_FOUND]: 'La rareza indicada no existe',
    [ERROR_KEYS.CARD_DELETED]: 'Carta eliminada correctamente',
    [ERROR_KEYS.FAVORITE_ADDED]: 'Carta agregada a favoritos correctamente',
    [ERROR_KEYS.FAVORITE_DELETED]: 'Carta eliminada de favoritos correctamente'
  },
  en: {
    [ERROR_KEYS.UNAUTHORIZED_HEADER]: {
      error: 'Unauthorized',
      message: 'An authentication token is required in the Authorization header with Bearer <token> format'
    },
    [ERROR_KEYS.TOKEN_INVALID]: {
      error: 'Invalid token',
      message: 'The provided authentication token is invalid or has expired'
    },
    [ERROR_KEYS.USER_NOT_FOUND]: {
      error: 'User not found',
      message: 'The user associated with the token no longer exists in the system'
    },
    [ERROR_KEYS.AUTH_REQUIRED]: {
      error: 'Unauthorized',
      message: 'Prior authentication is required to verify the role'
    },
    [ERROR_KEYS.FORBIDDEN_ROLE]: {
      error: 'Forbidden',
      message: (role) => `Access denied: the ${role} role is required to perform this operation`
    },
    [ERROR_KEYS.INTERNAL_SERVER_ERROR]: {
      error: 'Internal Server Error',
      message: 'An internal server error occurred'
    },
    [ERROR_KEYS.INVALID_DATA]: 'Invalid data',
    [ERROR_KEYS.EMAIL_REQUIRED]: 'Email is required',
    [ERROR_KEYS.NAME_REQUIRED]: 'Name is required',
    [ERROR_KEYS.PASSWORD_REQUIRED]: 'Password is required',
    [ERROR_KEYS.EMAIL_INVALID_FORMAT]: 'Invalid email format',
    [ERROR_KEYS.PASSWORD_TOO_SHORT]: 'Password must be at least 6 characters long',
    [ERROR_KEYS.NAME_TOO_SHORT]: 'Name must be at least 2 characters long',
    [ERROR_KEYS.NAME_TOO_LONG]: 'Name cannot exceed 50 characters',
    [ERROR_KEYS.EMAIL_ALREADY_REGISTERED]: {
      error: 'Email already registered',
      message: 'The specified email is already registered in the system'
    },
    [ERROR_KEYS.INCOMPLETE_CREDENTIALS]: {
      error: 'Incomplete credentials',
      message: 'You must provide both email and password'
    },
    [ERROR_KEYS.INVALID_CREDENTIALS]: {
      error: 'Invalid credentials',
      message: 'The email or password is incorrect'
    },
    [ERROR_KEYS.INVALID_CARD_ID]: 'The card ID must be a valid integer',
    [ERROR_KEYS.CARD_NOT_FOUND]: {
      error: 'Resource not found',
      message: 'The requested card does not exist'
    },
    [ERROR_KEYS.CARD_TYPE_NOT_FOUND]: 'The specified card type does not exist',
    [ERROR_KEYS.RARITY_NOT_FOUND]: 'The specified rarity does not exist',
    [ERROR_KEYS.CARD_DELETED]: 'Card deleted successfully',
    [ERROR_KEYS.FAVORITE_ADDED]: 'Card successfully added to favorites',
    [ERROR_KEYS.FAVORITE_DELETED]: 'Card successfully removed from favorites'
  }
};

/**
 * Traduce una clave de error al idioma seleccionado.
 * 
 * @param {string} key - Clave del error (de ERROR_KEYS).
 * @param {"es" | "en"} lang - Idioma seleccionado ("es" por defecto).
 * @param {Array} args - Argumentos para mensajes dinámicos (funciones).
 * @returns {any} La traducción (string u objeto).
 */
export function translate(key, lang = 'es', ...args) {
  const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.es;
  const translation = dictionary[key];
  if (!translation) return key;

  if (typeof translation === 'function') {
    return translation(...args);
  }

  if (typeof translation === 'object') {
    const result = { ...translation };
    if (typeof result.message === 'function') {
      result.message = result.message(...args);
    }
    return result;
  }

  return translation;
}
