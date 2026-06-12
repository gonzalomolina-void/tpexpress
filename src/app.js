import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
import cardRoutes from './routes/card.routes.js';
import authRoutes from './routes/auth.routes.js';
import favoriteRoutes from './routes/favorite.routes.js';
import aboutRoutes from './routes/about.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';


const require = createRequire(import.meta.url);
const swaggerDocument = require('../docs/swagger.json');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['X-Total-Count']
}));
app.use(cookieParser());
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
app.use('/api', authRoutes);
app.use('/api', favoriteRoutes);
app.use('/api', aboutRoutes);


// Middleware global de errores
app.use(errorHandler);

export default app;