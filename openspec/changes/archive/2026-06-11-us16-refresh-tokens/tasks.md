# Tasks: Implementación de Refresh Tokens para Sesiones Persistentes

## Phase 1: Infraestructura y Modelado

- [x] 1.1 Instalar `cookie-parser` como dependencia en `package.json`.
- [x] 1.2 Agregar el modelo `RefreshToken` y su relación con `User` en `prisma/schema.prisma`.
- [x] 1.3 Ejecutar `pnpm prisma migrate dev --name add_refresh_tokens` para aplicar el esquema.
- [x] 1.4 Registrar `cookie-parser` en `src/app.js` y corroborar soporte de `credentials: true` en CORS.

## Phase 2: Autenticación con Cookies (TDD)

- [x] 2.1 **RED**: Crear tests unitarios en `tests/auth.controller.test.js` para `login` validando emisión de access token (15m) y cookie `refreshToken` httpOnly (7d).
- [x] 2.2 **GREEN**: Modificar `login` en `src/controllers/auth.controller.js` para generar el UUID/token opaco en BD y setear la cookie en la respuesta.
- [x] 2.3 **REFACTOR**: Optimizar y modularizar la creación de tokens en `auth.controller.js`.

## Phase 3: Refresh y Logout Endpoints (TDD)

- [x] 3.1 **RED**: Escribir tests en `tests/auth.controller.test.js` para `/auth/refresh` y `/auth/logout` validando tokens válidos, revocados y expirados.
- [x] 3.2 **GREEN**: Implementar los controladores `refresh` y `logout` en `src/controllers/auth.controller.js` manipulando base de datos y cookies.
- [x] 3.3 **Wiring**: Exponer las nuevas rutas `/auth/refresh` y `/auth/logout` en `src/routes/auth.routes.js`.
- [x] 3.4 **REFACTOR**: Asegurar limpieza del manejo de excepciones en controladores.

## Phase 4: Integración y Verificación

- [x] 4.1 **RED**: Agregar los casos de prueba de integración `TC-23` (refresh exitoso), `TC-24` (refresh fallido 401), y `TC-25` (logout) en `Test-Api.ps1`.
- [x] 4.2 **GREEN**: Ejecutar `powershell -ExecutionPolicy Bypass -File .\Test-Api.ps1` y verificar que la suite pase exitosamente.

## Phase 5: Documentación y OpenAPI

- [x] 5.1 Documentar `/auth/refresh` y `/auth/logout` en `docs/swagger.json`.
