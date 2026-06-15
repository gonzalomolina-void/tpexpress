# Proposal: us-20-types-and-rarities-api

## Intent
Exponer endpoints del backend para obtener el listado de tipos (`GET /api/types`) y rarezas (`GET /api/rarities`) con soporte multi-idioma (i18n), evitando el hardcodeo de constantes en el frontend y habilitando la escalabilidad del catálogo.

## Scope

### In Scope
- Creación de enrutadores, controladores y servicios dedicados para `types` y `rarities`.
- Integración del middleware `requireAuth` para proteger las rutas.
- Traducción dinámica de nombres de tipos y rarezas usando `getLanguage(req)` con fallback automático a Español (`es`).
- Cobertura de tests unitarios del 100% en controladores y servicios de tipos y rarezas.

### Out of Scope
- Funcionalidad de ABM (creación/edición/borrado) de tipos y rarezas por interfaz (se realiza vía base de datos/seeds).
- Modificaciones en la base de datos (las tablas de traducción ya existen).

## Capabilities

### New Capabilities
- `parametric-lookups`: Endpoints para obtener listados de tipos y rarezas del juego con soporte bilingüe.

### Modified Capabilities
None

## Approach
Implementar los recursos de forma modular utilizando el patrón Controlador-Servicio del proyecto. Se realizarán consultas optimizadas en Prisma cargando traducciones por demanda y aplanando el resultado para devolver una estructura limpia al cliente.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/routes/type.routes.js` | New | Enrutador para types |
| `src/routes/rarity.routes.js` | New | Enrutador para rarities |
| `src/controllers/type.controller.js` | New | Controlador para types |
| `src/controllers/rarity.controller.js` | New | Controlador para rarities |
| `src/services/type.service.js` | New | Servicio de consultas Prisma para types |
| `src/services/rarity.service.js` | New | Servicio de consultas Prisma para rarities |
| `src/app.js` | Modified | Registrar enrutadores |
| `tests/` | New | Pruebas unitarias para controladores y servicios creados |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Inconsistencia de idioma en fallback | Low | Validar el fallback a `es` en pruebas unitarias del servicio. |
| Fallos de autenticación en tests | Low | Mockear correctamente `requireAuth` en los tests de controladores. |

## Rollback Plan
Revertir commits y eliminar los archivos nuevos creados; remover el registro de rutas en `src/app.js`.

## Dependencies
None

## Success Criteria
- [ ] Endpoints `GET /api/types` y `GET /api/rarities` responden con código 200 y JSON aplanado.
- [ ] Peticiones sin token JWT son rechazadas con error `401 Unauthorized`.
- [ ] El query `?lang=en` o cabecera `Accept-Language: en` traduce los nombres de tipos y rarezas al inglés.
- [ ] Cobertura de pruebas unitarias al 100% pasando en verde.
