/**
 * Constantes de Roles del Sistema
 */
export const ROLES = {
  ADMIN: 'admin',
  USER: 'usuario'
};

/**
 * Configuración de Autenticación
 */
export const AUTH_CONFIG = {
  COOKIE_NAME: 'refreshToken',
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000 // 7 días en milisegundos
};
