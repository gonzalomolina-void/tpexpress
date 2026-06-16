# Design: API Health Metadata and Version Bump (US-21)

## Technical Approach
El objetivo es exponer metadatos del proyecto (`name`, `version`, `description`) definidos en `package.json` a través de la respuesta del endpoint `/api/health`. Para lograrlo de manera óptima y compatible con el entorno ESM actual, se utilizará la utilidad `createRequire` para importar de manera estática los metadatos en la inicialización del controlador de salud.

## Architecture Decisions

### Decision: Lectura de JSON en ESM

**Choice**: Utilizar `createRequire(import.meta.url)` para instanciar la función `require` tradicional e importar `package.json`.
**Alternatives considered**: Usar `import packageJson from '../../package.json' assert { type: 'json' }` (o `with { type: 'json' }`), o leer con `fs.promises.readFile`.
**Rationale**: Las sintaxis de importación directa de JSON con `assert` o `with` están sujetas a cambios y variaciones de soporte según la versión de Node.js. `createRequire` ya se utiliza con éxito en el codebase ([src/app.js](file:///C:/Work/Uncoma/PWA/tpexpress/src/app.js#L16)) para cargar la documentación de Swagger, por lo que su adopción mantiene la consistencia arquitectónica y es 100% compatible con ESM.

### Decision: Caching en Runtime

**Choice**: Importar y desestructurar `package.json` en el top-level del módulo del controlador (inicialización estática).
**Alternatives considered**: Leer el archivo JSON de forma asíncrona dentro del controlador `getHealth` en cada petición entrante.
**Rationale**: Los metadatos de la aplicación son estáticos y no cambian mientras el proceso esté activo. Leer el archivo del disco en cada request a `/api/health` introduce latencia de E/S innecesaria. Almacenar los datos en memoria al cargar el archivo maximiza el rendimiento y la simplicidad del código.

## Data Flow
```
[Inicio del Server]
        │
        ▼
[Importar health.controller.js] ──► createRequire() ──► Leer package.json ──► Cachear { name, version, description }
        │
        ▼
[Cliente GET /api/health] ───────► getHealth() ───────────────────────────► Retornar JSON (200 OK)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Actualizar los campos `name` a `"hexa-tcg-api"`, `version` a `"1.1.0"` y `description` al texto institucional profesional. |
| `src/controllers/health.controller.js` | Modify | Importar `createRequire`, leer `package.json` y enriquecer la respuesta del controlador. |
| `tests/health.controller.test.js` | Modify | Actualizar assertions del test unitario para reflejar la nueva estructura del JSON de respuesta. |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Formato de respuesta de `/api/health` | Modificar [tests/health.controller.test.js](file:///C:/Work/Uncoma/PWA/tpexpress/tests/health.controller.test.js) aplicando TDD. Primero se actualizan las aserciones del test unitario para verificar los nuevos campos esperados. El test debe fallar (RED), y luego se modifica el controlador para que pase (GREEN). |

## Migration / Rollout
No se requieren migraciones de base de datos ni scripts de despliegue adicionales. Los metadatos estarán disponibles en cuanto la nueva versión de la API sea compilada y desplegada.

## Open Questions
Ninguna.
