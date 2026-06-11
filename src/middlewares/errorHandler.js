import { getLanguage } from '../utils/i18n.js';
import { ERROR_KEYS, translate } from '../utils/errors.i18n.js';

export function errorHandler(err, req, res, next) {
  console.error('[Error Handler] Ocurrió un error no manejado:', err);
  const lang = getLanguage(req);
  const errorMsg = translate(ERROR_KEYS.INTERNAL_SERVER_ERROR, lang);

  res.status(500).json({
    error: errorMsg.error,
    message: process.env.NODE_ENV === 'development' ? err.message : errorMsg.message
  });
}
