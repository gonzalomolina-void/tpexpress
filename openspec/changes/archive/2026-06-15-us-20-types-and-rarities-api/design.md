# Design: us-20-types-and-rarities-api

## Technical Approach
Implementación modular de consultas de sólo lectura para los recursos `CardType` y `Rarity` utilizando el patrón Controlador-Servicio del backend. Expondremos los endpoints protegidos `GET /api/types` y `GET /api/rarities` con soporte bilingüe (i18n). Las consultas de base de datos se realizarán a través del cliente de Prisma, resolviendo las traducciones según la cabecera `Accept-Language` o query `?lang=`.

---

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| **Dedicated Routers/Controllers** (Modular) | Requiere crear más archivos, pero mantiene SRP limpio. | **Elegido:** Sigue el patrón establecido del proyecto y facilita el testing en aislamiento. |
| **Monolithic integration in card controllers** | Reduce archivos creados, pero sobrecarga el controlador de cartas violando SRP. | **Rechazado** |
| **Direct Prisma mapping in controllers** | Ahorra un archivo de servicio, pero acopla el controlador a la BD directamente. | **Rechazado** |

---

## Data Flow

```
Cliente ──[JWT Token & Accept-Language]──→ Router (requireAuth)
                                              │
  Controller (resuelve idioma lang) ←─────────┘
        │
        ▼
  Service (consulta prisma + fallback es)
        │
        ▼
  Database (card_types/rarities + translations)
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/routes/type.routes.js` | Create | Enrutador Express para types |
| `src/routes/rarity.routes.js` | Create | Enrutador Express para rarities |
| `src/controllers/type.controller.js` | Create | Controlador para types (gestión de i18n y respuestas) |
| `src/controllers/rarity.controller.js` | Create | Controlador para rarities (gestión de i18n y respuestas) |
| `src/services/type.service.js` | Create | Servicio Prisma para consultar tipos y aplanar JSON |
| `src/services/rarity.service.js` | Create | Servicio Prisma para consultar rarezas y aplanar JSON |
| `src/app.js` | Modify | Registrar los enrutadores de types y rarities |
| `src/prisma/__mocks__/prismaClient.js` | Modify | Agregar mocks `findMany` en `cardType` y `rarity` |
| `tests/type.controller.test.js` | Create | Tests de controlador de tipos |
| `tests/rarity.controller.test.js` | Create | Tests de controlador de rarezas |
| `tests/type.service.test.js` | Create | Tests de servicio de tipos con Prisma mockeado |
| `tests/rarity.service.test.js` | Create | Tests de servicio de rarezas con Prisma mockeado |

---

## Interfaces / Contracts

### GET /api/types response payload
```json
[
  { "id": 1, "code": "creature", "name": "Criatura", "labelKey": "card.types.creature" }
]
```

### GET /api/rarities response payload
```json
[
  { "id": 1, "code": "poor", "name": "Pobre", "labelKey": "card.rarities.poor" }
]
```

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (Controllers) | Retorno exitoso 200, invocación del servicio con idioma correcto, propagación de errores. | Mockear el servicio, pasar req/res simulados en Vitest. |
| Unit (Services) | Consulta a base de datos, aplanamiento, traducción dinámica, fallback a Español (`es`). | Mockear Prisma Client (`findMany`) en Vitest. |

---

## Migration / Rollout
No database migrations required. The tables and seeds already exist in Prisma.

---

## Open Questions
None
