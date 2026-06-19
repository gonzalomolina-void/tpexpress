# Proposal: US 21 - Ajustes de Seguridad y Códigos de Estado HTTP

## Intent

Alinear el backend y frontend con la especificación de la cátedra mediante la devolución de códigos de estado HTTP semánticos (`409 Conflict` y `404 Not Found`) en escenarios de error de autenticación y de favoritos.

## Scope

### In Scope
- Retornar `409 Conflict` en `POST /auth/register` ante emails duplicados.
- Retornar `409 Conflict` en `POST /favorites` si la relación de favoritos ya existe.
- Retornar `404 Not Found` en `DELETE /favorites/:id` si el favorito no existía.
- Adaptar frontend React para procesar estos códigos de error e informar adecuadamente al usuario.
- Actualizar y adecuar la suite de pruebas unitarias en backend.

### Out of Scope
- Modificar el método de agregar favorito a `POST /favorites/:id` (se mantiene en body por decisión de arquitectura).
- Ajustes adicionales de seguridad no contemplados.

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `user-auth-refresh-tokens`: return `409 Conflict` on duplicate email in `POST /auth/register`.
- `favorites`: return `409 Conflict` on duplicate in `POST /favorites`, and `404 Not Found` on deleting non-existent favorite.

## Approach

- **Backend**: Implementar aproximación Select-Before-Insert usando `findUnique` para verificar duplicados en emails y favoritos antes de escribir. Evaluar el retorno de `removeFavorite` y responder `404` si es nulo.
- **Frontend**: Capturar el status `409` en el formulario de registro de React para mostrar el mensaje correspondiente. Manejar `404` y `409` en el flujo de favoritos.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/controllers/auth.controller.js` | Modified | Retornar `409` al registrar email duplicado. |
| `src/controllers/favorite.controller.js` | Modified | Retornar `409` en alta de favorito duplicado y `404` en eliminación de favorito inexistente. |
| `src/services/favorite.service.js` | Modified | Añadir helper `getFavorite`. |
| `tests/auth.controller.test.js` | Modified | Ajustar tests para asertar código `409`. |
| `tests/favorite.controller.test.js` | Modified | Ajustar tests para asertar códigos `409` y `404`. |
| `frontend/` | Modified | Adecuar componentes de registro y favoritos para capturar nuevos códigos de estado. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Descoordinación de Axios / Interceptores de Red en el frontend con las respuestas 409 y 404. | Low | Manejar explícitamente los códigos de respuesta en los try/catch de los componentes de React. |

## Rollback Plan

Revertir los commits de Git de la rama `feat/us-21-security-adjustments` y volver al baseline de `develop`.

## Dependencies

None

## Success Criteria

- [ ] `POST /api/auth/register` retorna `409 Conflict` para email duplicado.
- [ ] `POST /api/favorites` retorna `409 Conflict` para favorito duplicado.
- [ ] `DELETE /api/favorites/:id` retorna `404 Not Found` si no existía.
- [ ] Todos los tests de backend modificados pasan exitosamente.
- [ ] El frontend muestra "El email ya está registrado" al recibir un `409`.
