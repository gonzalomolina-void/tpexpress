# Proposal: Implementación de Refresh Tokens para Sesiones Persistentes

## Intent

Implementar refresh tokens seguros para permitir sesiones de usuario persistentes, reduciendo la ventana de exposición del access token al bajar su expiración a 15 minutos y guardando el refresh token en una cookie httpOnly en base de datos.

## Scope

### In Scope
- Crear modelo `RefreshToken` en `schema.prisma` con expiración y revocación.
- Configurar `cookie-parser` en Express.
- Habilitar `credentials: true` en CORS en el backend.
- Modificar `POST /api/auth/login` y `register` para emitir access token (15m en JSON) y refresh token (7d en cookie httpOnly).
- Crear endpoints `POST /api/auth/refresh` y `POST /api/auth/logout`.
- Agregar pruebas unitarias y de integración.

### Out of Scope
- Lógica de rotación de tokens (refresh token rotation) para múltiples usos.
- Implementación de interfaz de frontend (se asume listo).

## Capabilities

### New Capabilities
- `user-auth-refresh-tokens`: Autenticación y ciclo de vida del refresh token y acceso persistente.

### Modified Capabilities
None

## Approach

- El login genera un Access Token JWT de 15m (enviado en el JSON) y un Refresh Token UUID o JWT opaco persistido en PostgreSQL (enviado mediante cookie httpOnly, Secure, SameSite=Strict).
- El endpoint `/auth/refresh` lee la cookie, verifica el token en la base de datos (que no esté expirado ni revocado), y emite un nuevo Access Token.
- El logout elimina el token de la base de datos y borra la cookie del navegador.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modified | Agregar modelo `RefreshToken` y su relación. |
| `src/app.js` | Modified | Registrar `cookie-parser` y habilitar credenciales CORS. |
| `src/controllers/auth.controller.js` | Modified | Login/Register emiten tokens; agregar refresh y logout. |
| `src/routes/auth.routes.js` | Modified | Exponer endpoints `/auth/refresh` y `/auth/logout`. |
| `package.json` | Modified | Dependencia `cookie-parser`. |
| `Test-Api.ps1` | Modified | Pruebas de integración para refresh y logout. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CORS bloquea cookies | Medium | Configurar `origin` explícito y `credentials: true` en CORS. |
| Expiración prematura | Low | Configurar tiempos holgados en el refresh token (7 días). |

## Rollback Plan

1. Revertir cambios en Git (`git checkout .`).
2. Eliminar la migración de Prisma generada.
3. Desinstalar `cookie-parser` (`pnpm remove cookie-parser`).

## Dependencies

- Dependencia npm: `cookie-parser`.
- Ejecutar migración de base de datos (`prisma migrate dev`).

## Success Criteria

- [ ] `POST /api/auth/login` retorna access token de corta duración en body y cookie `refreshToken` httpOnly.
- [ ] `POST /api/auth/refresh` renueva exitosamente el access token.
- [ ] `POST /api/auth/logout` invalida el refresh token en base de datos.
