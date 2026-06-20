import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
import cardRoutes from './routes/card.routes.js';
import authRoutes from './routes/auth.routes.js';
import favoriteRoutes from './routes/favorite.routes.js';
import aboutRoutes from './routes/about.routes.js';
import healthRoutes from './routes/health.routes.js';
import typeRoutes from './routes/type.routes.js';
import rarityRoutes from './routes/rarity.routes.js';
import profileRoutes from './routes/profile.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { i18nMiddleware } from './utils/errors.i18n.js';

const require = createRequire(import.meta.url);
const swaggerDocument = require('../docs/swagger.json');

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
    exposedHeaders: ['X-Total-Count']
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(i18nMiddleware);

// Servir documentación de Swagger interactiva
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Registrar rutas
app.use('/api/health', healthRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/rarities', rarityRoutes);

// Middleware global de errores
app.use(errorHandler);

export default app;
