const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Server] Servidor Express corriendo en http://localhost:${PORT}`);
});
