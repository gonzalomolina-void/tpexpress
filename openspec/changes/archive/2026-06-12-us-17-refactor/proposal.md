# Proposal: us-17-refactor

## Executive Summary
Esta propuesta detalla la estandarización y refactorización del backend de la aplicación, enfocándose en la modularización de rutas, la extracción de controladores inline a funciones dedicadas en `src/controllers/`, la unificación del parámetro de ID en la API de favoritos y la centralización de strings mágicos de autenticación y roles en `src/constants/auth.constants.js`.

## Technical Approach
1. **Desacoplamiento del Healthcheck**: Se removerá el handler de `GET /api/health` de `src/app.js` y se creará `src/routes/health.routes.js` para registrarlo de forma limpia en el router `/api`.
2. **Modularización de Auth**: Se extraerá el controlador inline de `GET /auth/me` a una función `getMe` en `src/controllers/auth.controller.js` y se importará en `src/routes/auth.routes.js`.
3. **Estandarización de Favoritos**:
   - Modificar la ruta de favoritos en `favorite.routes.js` de `/favorites/:cardId` a `/favorites/:id`.
   - Modificar `removeFavorite` en `src/controllers/favorite.controller.js` para extraer `req.params.id` en lugar de `req.params.cardId`.
   - Modificar los unit tests en `tests/favorite.controller.test.js` para que coincidan con la ruta `/favorites/:id`.
4. **Constantes y Strings Mágicos**:
   - Agregar configuración de cookies y tokens en `src/constants/auth.constants.js` (`AUTH_CONFIG` con `COOKIE_NAME`, `ACCESS_TOKEN_EXPIRY`, `REFRESH_TOKEN_EXPIRY`, `COOKIE_MAX_AGE`).
   - Reemplazar las cadenas de texto harcodeadas en `auth.controller.js` y middlewares por las constantes importadas.

## Affected Modules
- `src/app.js`
- `src/routes/auth.routes.js`
- `src/controllers/auth.controller.js`
- `src/routes/favorite.routes.js`
- `src/controllers/favorite.controller.js`
- `src/constants/auth.constants.js`
- `tests/favorite.controller.test.js`

## Rollback Plan
En caso de falla crítica, se puede volver a la rama original usando Git (`git checkout main`) o realizar un revert de los commits de refactorización (`git revert HEAD`). La refactorización no modifica la estructura de la base de datos de Prisma, por lo que no requiere rollback de migraciones.
