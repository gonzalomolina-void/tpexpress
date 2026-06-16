# Proposal: API Health Metadata and Version Bump (US-21)

## Intent
Enriquecer el endpoint de salud `/api/health` para proveer metadatos clave de la API (nombre, versión, descripción) leídos dinámicamente de `package.json` antes de pasar a producción. Adicionalmente, actualizar el archivo `package.json` con el nombre profesional del proyecto (`hexa-tcg-api`), la descripción correspondiente, e incrementar la versión a `1.1.0` (asociada a la incorporación de seguridad).

## Scope

### In Scope
- Cambiar el campo `name` en `package.json` a `"hexa-tcg-api"`.
- Cambiar el campo `version` en `package.json` a `"1.1.0"`.
- Actualizar el campo `description` en `package.json` a un texto descriptivo y profesional para Hexa TCG.
- Modificar el controlador `getHealth` en `src/controllers/health.controller.js` para que lea dinámicamente y retorne el `name`, `version` y `description` del `package.json`.
- Modificar o crear los tests correspondientes para verificar que `/api/health` retorna los nuevos metadatos.

### Out of Scope
- Configuración de pipelines de CI/CD para el despliegue automático.
- Integración de otras variables de diagnóstico más avanzadas (ej. estado detallado de la conexión a la base de datos o uptime en esta iteración).

## Capabilities

### Modified Capabilities
- `diagnostics`: Modificar el endpoint de salud `/api/health` para incluir nombre, versión y descripción del servicio.

## Approach
- Utilizar `createRequire` de Node.js (ya importado en `src/app.js`) dentro de `src/controllers/health.controller.js` para leer de forma síncrona el archivo `package.json` en runtime.
- Cachear los metadatos al levantar el servidor o leerlos dinámicamente (dado que son estáticos durante la ejecución, leerlos una vez o en cada petición es aceptable, pero por simplicidad de código y consistencia con ESM se importará el JSON al inicio del archivo del controlador utilizando `createRequire`).
- Actualizar la especificación `diagnostics` creando un delta spec en la carpeta del cambio o modificando directamente la especificación si corresponde (en este caso, crearemos el delta spec en `openspec/changes/us-21-api-version/specs/diagnostics/spec.md`).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json` | Modified | Actualización de name, version y description. |
| `src/controllers/health.controller.js` | Modified | Modificación del response de `getHealth` para incluir los metadatos leídos de `package.json`. |
| `tests/health.controller.test.js` | Modified | Pruebas unitarias para asegurar que el endpoint retorna la estructura correcta. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Error de importación de JSON en ESM en entornos de build específicos | Low | Usar la técnica ya probada `createRequire(import.meta.url)` en lugar de imports directos con assert/with. |
| Inconsistencia de ruta relativa al `package.json` si el controlador se mueve | Low | Definir la ruta relativa de forma robusta con respecto a `import.meta.url` o simplemente con respecto a la estructura actual. |

## Rollback Plan
- Revertir los cambios en `package.json` y `src/controllers/health.controller.js` usando Git (`git checkout`).

## Success Criteria
- [ ] Ejecutar `pnpm test` y que todos los tests pasen con éxito (incluidos los nuevos tests para el health check).
- [ ] La petición `GET /api/health` retorna un estado 200 OK con un JSON que contiene `status: "ok"`, `name: "hexa-tcg-api"`, `version: "1.1.0"` y la descripción profesional correcta.
