# Tasks: API Health Metadata and Version Bump (US-21)

## Phase 1: Foundation (Metadata Setup)

- [x] 1.1 Modificar [package.json](file:///C:/Work/Uncoma/PWA/tpexpress/package.json) actualizando `"name"` a `"hexa-tcg-api"`, `"version"` a `"1.1.0"`, y `"description"` a `"API REST oficial para Hexa TCG, proporcionando soporte para gestión de cartas, autenticación de usuarios, favoritos y más, con persistencia en base de datos PostgreSQL mediante Prisma ORM."`.

## Phase 2: Core Implementation & TDD

- [x] 2.1 **RED**: Modificar el archivo [tests/health.controller.test.js](file:///C:/Work/Uncoma/PWA/tpexpress/tests/health.controller.test.js) para que las aserciones verifiquen que la respuesta de `getHealth` contiene los metadatos `"name"`, `"version"`, y `"description"` leídos de `package.json`.
- [x] 2.2 **RED**: Correr la suite de pruebas unitarias y verificar que el test de health check falle de manera esperada (RED).
- [x] 2.3 **GREEN**: Modificar [src/controllers/health.controller.js](file:///C:/Work/Uncoma/PWA/tpexpress/src/controllers/health.controller.js) importando `package.json` mediante `createRequire` y enriqueciendo el JSON de respuesta en `getHealth`.
- [x] 2.4 **GREEN**: Correr la suite de pruebas unitarias y verificar que todas las pruebas pasen con éxito (GREEN).
- [x] 2.5 **REFACTOR**: Revisar el código implementado y los tests para asegurar limpieza, correcta modularización y ausencia de advertencias.

## Phase 3: Integration & Verification

- [x] 3.1 Ejecutar la suite completa de pruebas unitarias e integración en el entorno local (`pnpm test`) para garantizar que no existan regresiones.
- [x] 3.2 Levantar el servidor localmente con `pnpm dev` y realizar una petición `GET http://localhost:3000/api/health` para comprobar manualmente el formato final del JSON.
