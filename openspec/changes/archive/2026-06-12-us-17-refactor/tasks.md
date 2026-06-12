# Tasks: us-17-refactor

## Phase 1: Foundation / Infrastructure
- [x] 1.1 Modificar `src/constants/auth.constants.js` agregando la constante de configuración `AUTH_CONFIG` para cookies y expiración de JWT.
- [x] 1.2 Crear el controlador básico de salud en `src/controllers/health.controller.js` definiendo la función `getHealth`.
- [x] 1.3 Crear el enrutador de salud en `src/routes/health.routes.js` que invoque a `getHealth`.

## Phase 2: Core Implementation
- [x] 2.1 Refactorizar `src/controllers/auth.controller.js` para migrar los strings mágicos de cookies, tokens y maxAge al objeto `AUTH_CONFIG`.
- [x] 2.2 Implementar la función controladora `getMe` en `src/controllers/auth.controller.js` para retornar el perfil del usuario autenticado.
- [x] 2.3 Refactorizar `src/controllers/favorite.controller.js` en la función `removeFavorite` para extraer `id` de `req.params` en lugar de `cardId`, adaptando la validación numérica correspondiente.

## Phase 3: Integration / Wiring
- [x] 3.1 Registrar el nuevo router `healthRoutes` en `src/app.js` y remover el endpoint `/api/health` declarado de forma inline.
- [x] 3.2 Modificar `src/routes/auth.routes.js` para enlazar la ruta `/auth/me` con la función controladora `getMe`, eliminando el callback inline.
- [x] 3.3 Modificar `src/routes/favorite.routes.js` cambiando la ruta `/favorites/:cardId` por `/favorites/:id`.

## Phase 4: Testing (Strict TDD)
- [x] 4.1 **RED**: Modificar `tests/favorite.controller.test.js` en los tests de `DELETE /api/favorites/:cardId` para pasarle `req.params.id` y correr la prueba unitaria (debería fallar si no se actualizó el controlador/rutas, o en TDD estricto, escribimos el cambio de parámetros en el test primero).
- [x] 4.2 **GREEN**: Asegurar que las pruebas unitarias en `tests/favorite.controller.test.js` pasen exitosamente al 100% tras el cambio de parámetro a `:id`.
- [x] 4.3 **GREEN**: Escribir pruebas unitarias en `tests/auth.controller.test.js` para la nueva función `getMe` y asegurar que pasen.
- [x] 4.4 **GREEN**: Escribir pruebas unitarias en un nuevo archivo `tests/health.controller.test.js` para la lógica de `getHealth` y asegurar que pasen.
- [x] 4.5 **VERIFY**: Ejecutar la suite completa de integración con `./Test-Api.ps1` y asegurar tasa de éxito del 100%.

## Phase 5: Cleanup / Documentation
- [x] 5.1 Actualizar documentación interactiva de Swagger en `docs/swagger.json` si hay dependencias o referencias a `/favorites/:cardId`.
- [x] 5.2 Eliminar cualquier código y comentario temporal remanente de la refactorización.

