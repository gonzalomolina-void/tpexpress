# Design: us-17-refactor

## Technical Approach
Refactorizar y estandarizar la estructura del backend de la aplicación para eliminar callbacks inline, desacoplar utilidades de diagnóstico, homogeneizar los parámetros identificadores en favoritos, y centralizar los strings mágicos de la configuración de cookies y JWT en constantes del sistema.

## Architecture Decisions

### Decision: Desacoplamiento de Health Check
**Choice**: Crear un router dedicado `src/routes/health.routes.js` y un controlador `src/controllers/health.controller.js`.
**Alternatives considered**: Dejar la lógica inline en `src/app.js`, o mover la ruta pero dejar el callback inline en el router.
**Rationale**: Se alinea al 100% con los criterios de aceptación de la US 17 que prohíben explílicamente callbacks inline en rutas y exigen que ninguna ruta resida en `src/app.js`.

### Decision: Centralización de Configuración de Auth
**Choice**: Añadir la constante `AUTH_CONFIG` dentro del archivo existente `src/constants/auth.constants.js`.
**Alternatives considered**: Crear un nuevo archivo `src/config/constants.js`.
**Rationale**: Dado que la carpeta `src/constants` ya contiene `auth.constants.js` con la estructura de roles, agrupar las constantes relativas a la expiración de tokens, nombres de cookies y SameSite en el mismo archivo mantiene la consistencia modular actual sin dispersar la configuración.

## Data Flow
Para `DELETE /api/favorites/:id`:

    Client (HTTP DELETE) ──→ src/routes/favorite.routes.js ──→ src/controllers/favorite.controller.js
                                                                          │
                                                                   (req.params.id)
                                                                          │
                                                                          ▼
                                                             src/services/favorite.service.js

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/routes/health.routes.js` | Create | Enrutador dedicado para endpoints de diagnóstico (health check). |
| `src/controllers/health.controller.js` | Create | Controlador para manejar la lógica de diagnóstico y salud. |
| `src/app.js` | Modify | Remover endpoint `/api/health` inline y registrar el nuevo router de healthcheck. |
| `src/routes/auth.routes.js` | Modify | Modificar endpoint `GET /auth/me` para invocar al controlador `getMe` en lugar del callback inline. |
| `src/controllers/auth.controller.js` | Modify | Implementar el controlador `getMe` y refactorizar el uso de strings mágicos de tokens/cookies usando la constante `AUTH_CONFIG`. |
| `src/routes/favorite.routes.js` | Modify | Modificar la ruta de eliminación de favoritos para usar el parámetro `:id` en lugar de `:cardId`. |
| `src/controllers/favorite.controller.js` | Modify | Adaptar el controlador `removeFavorite` para que extraiga `id` de `req.params` y lo parsee a entero. |
| `src/constants/auth.constants.js` | Modify | Exportar la constante `AUTH_CONFIG` con configuraciones de JWT y cookies. |
| `tests/favorite.controller.test.js` | Modify | Adaptar las pruebas unitarias para usar `req.params.id` en lugar de `req.params.cardId` para la eliminación. |

## Interfaces / Contracts

En `src/constants/auth.constants.js`:
```javascript
export const AUTH_CONFIG = {
  COOKIE_NAME: 'refreshToken',
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000 // 7 días en ms
};
```

En `src/controllers/auth.controller.js` (nuevo controlador):
```javascript
export async function getMe(req, res, next) {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Health Check Controller | Validar que el controlador retorne status 200 y el formato JSON esperado. |
| Unit | Auth Controller (getMe) | Validar que retorne la información de `req.user` sin password y status 200. |
| Unit | Favorite Controller (removeFavorite) | Validar que lea `req.params.id` correctamente y maneje adecuadamente los IDs no numéricos (status 400). |
| Integration | API Tests | Ejecutar la suite completa (`Test-Api.ps1`) para verificar que las rutas `/api/health`, `/api/auth/me` y `/api/favorites/:id` sigan respondiendo de acuerdo a las pruebas globales. |

## Migration / Rollout
No migration required.

## Open Questions
None
