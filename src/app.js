import express from 'express';

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

export default app;

