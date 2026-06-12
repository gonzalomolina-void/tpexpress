## Exploration: us-17-refactor

### Current State
El servidor tiene un diseño Controller/Service con Express. Sin embargo, se identificaron las siguientes inconsistencias arquitectónicas:
1. El healthcheck (`GET /api/health`) está declarado de forma inline directamente en `src/app.js` en lugar de estar en un enrutador dedicado en `src/routes/`.
2. El endpoint de autenticación `GET /auth/me` posee un callback inline anónimo en `src/routes/auth.routes.js` en lugar de delegar en un controlador en `src/controllers/auth.controller.js`.
3. El endpoint de favoritos usa el parámetro `:cardId` en su ruta `DELETE /favorites/:cardId` y en su controlador `removeFavorite`, rompiendo la convención de usar `:id` para referencias a recursos específicos en las rutas.
4. Existen múltiples strings mágicos hardcodeados repetidamente como `"refreshToken"`, `"15m"`, `"7d"`, `"admin"` y `"usuario"`.

### Affected Areas
- `src/app.js` — Mover la ruta de healthcheck `/api/health` e importación del nuevo router.
- `src/routes/health.routes.js` — Creación del nuevo router de diagnóstico/utilidades.
- `src/routes/auth.routes.js` — Modificar la ruta `/auth/me` para invocar al controlador `getMe`.
- `src/controllers/auth.controller.js` — Definir e implementar el controlador `getMe`. Añadir uso de constantes para tokens/cookies.
- `src/routes/favorite.routes.js` — Modificar la ruta de eliminación para usar `:id` en lugar de `:cardId`.
- `src/controllers/favorite.controller.js` — Actualizar el controlador `removeFavorite` para leer `req.params.id`.
- `src/constants/auth.constants.js` — Centralizar constantes de configuración de tokens, cookies y duraciones.
- `tests/favorite.controller.test.js` — Actualizar las pruebas para usar `req.params.id` y asegurar compatibilidad de contratos.

### Approaches
1. **Refactorización Directa y Estandarización Modular** — Migrar los endpoints inline a controladores, mover el healthcheck a su propio enrutador, y reescribir los parámetros a `:id`.
   - Pros: Limpieza arquitectónica completa, alineación a buenas prácticas REST, desacoplamiento y mayor legibilidad.
   - Cons: Requiere modificar y adaptar pruebas unitarias que comprueban la ruta de favoritos.
   - Effort: Low-Medium
2. **Refactorización Parcial (sin cambiar parámetros en favoritos)** — Mantener `:cardId` pero separar controladores y constantes.
   - Pros: No rompe los tests actuales de favoritos.
   - Cons: Incumple el criterio de aceptación de estandarización de parámetros de la US 17.
   - Effort: Low

### Recommendation
Se recomienda el Enfoque 1 porque cumple estrictamente con el criterio de aceptación y la visión de diseño de unificar las APIs. El costo de adaptar los tests de favoritos es mínimo y mantiene consistencia a largo plazo.

### Risks
- Romper la integración con el cliente frontend si el frontend depende del parámetro anterior, aunque en REST el endpoint se consume de manera transparente. En este caso se actualiza el parámetro de la ruta y los tests para mantener consistencia.
- Errores sintácticos en la importación/exportación de ES Modules de las constantes.

### Ready for Proposal
Yes
