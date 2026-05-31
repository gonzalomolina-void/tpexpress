import express from 'express';
import cardRoutes from './routes/card.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Middlewares
app.use(express.json());

// Ruta de health check directa
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API funcionando correctamente'
  });
});

// Registrar rutas
app.use('/api', cardRoutes);

// Middleware global de errores
app.use(errorHandler);

export default app;