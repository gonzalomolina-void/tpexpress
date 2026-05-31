export function errorHandler(err, req, res, next) {
  console.error('[Error Handler] Ocurrió un error no manejado:', err);

  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error inesperado.'
  });
}
