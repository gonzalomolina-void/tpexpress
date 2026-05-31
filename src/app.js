import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
import cardRoutes from './routes/card.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const require = createRequire(import.meta.url);
const swaggerDocument = require('../docs/swagger.json');

const app = express();

// Middlewares
app.use(express.json());

// Servir documentación de Swagger interactiva
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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