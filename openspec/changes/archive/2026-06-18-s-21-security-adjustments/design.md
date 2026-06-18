# Design: US 21 - Ajustes de Seguridad y Códigos de Estado HTTP

## Technical Approach

Implementar verificaciones previas a la inserción en la base de datos (Select-Before-Insert) utilizando Prisma en los controladores para retornar códigos HTTP semánticos (`409 Conflict`). En la eliminación de favoritos, se evaluará el resultado devuelto por el ORM para retornar `404 Not Found` en caso de que no existiera la relación previa.

## Architecture Decisions

### Decision: Verificación de Duplicados en Favoritos
**Choice**: Usar `prisma.favorite.findUnique` en el controlador antes de invocar el servicio de creación.
**Alternatives considered**: Confiar en la base de datos e interceptar el error `P2002` (Unique constraint violation) en el bloque catch.
**Rationale**: Mantener la lógica del flujo de negocio explícita, desacoplada del motor de BD, y consistente con la forma en que ya se valida el email en el registro. Facilita las pruebas de Vitest.

### Decision: Mantener ID del Favorito en el Cuerpo (Body)
**Choice**: Conservar la ruta como `POST /api/favorites` enviando `cardId` en el cuerpo.
**Alternatives considered**: Migrar a `POST /api/favorites/:id`.
**Rationale**: Conforme a la decisión del arquitecto, es el estándar más limpio para peticiones POST que crean recursos y se alinea con las mejores prácticas REST de diseño.

## Data Flow

```
[Frontend (React)] ── POST /api/auth/register (Email) ─→ [auth.controller] ── getUserByEmail ─→ [DB] (exists? -> 409 Conflict)
[Frontend (React)] ── POST /api/favorites (cardId) ──→ [favorite.controller] ── findUnique ────→ [DB] (exists? -> 409 Conflict)
[Frontend (React)] ── DELETE /api/favorites/:id ──────→ [favorite.controller] ── delete ────────→ [DB] (deleted == null? -> 404 Not Found)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/services/favorite.service.js` | Modify | Agregar el helper `getFavorite(userId, cardId)` para buscar una relación de favorito específica. |
| `src/controllers/auth.controller.js` | Modify | Cambiar el código de estado devuelto de `400` a `409` en la validación de email existente. |
| `src/controllers/favorite.controller.js` | Modify | Implementar chequeo de existencia de favorito antes de insertar (retornando `409`). Evaluar el retorno de `removeFavorite` para lanzar `404` si es nulo. |
| `tests/auth.controller.test.js` | Modify | Ajustar las aserciones de pruebas de `400` a `409` para registros con email en uso. |
| `tests/favorite.controller.test.js` | Modify | Ajustar tests unitarios para asertar `409` en altas duplicadas y `404` en bajas inexistentes. |

## Interfaces / Contracts

### favorites (getFavorite helper)
```javascript
export async function getFavorite(userId, cardId) {
  return prisma.favorite.findUnique({
    where: {
      userId_cardId: { userId, cardId }
    }
  });
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Registro de email duplicado en auth controller | Mockear `userService.getUserByEmail` para retornar un usuario y asertar status 409. |
| Unit | Alta de favorito duplicado en favorite controller | Mockear `favoriteService.getFavorite` para retornar un favorito y asertar status 409. |
| Unit | Baja de favorito inexistente en favorite controller | Mockear `favoriteService.removeFavorite` para retornar null y asertar status 404. |

## Migration / Rollout

No migration required.
