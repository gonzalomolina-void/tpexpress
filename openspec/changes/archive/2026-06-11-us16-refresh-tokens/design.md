# Design: Implementación de Refresh Tokens para Sesiones Persistentes

## Technical Approach

El flujo de refresco de tokens se implementará dividiendo las responsabilidades entre un Access Token de corta duración (15 minutos) enviado en el payload JSON y un Refresh Token de larga duración (7 días) enviado en una cookie segura de solo lectura HTTP (`httpOnly`). Los Refresh Tokens se guardarán de forma opaca y aleatoria en PostgreSQL mediante Prisma, vinculados al usuario, permitiendo revocación y múltiples sesiones concurrentes.

## Architecture Decisions

### Decision: Tipo y Almacenamiento de Refresh Token
| Opción | Tradeoffs | Decisión |
|---|---|---|
| JWT Autocontenido | + No requiere almacenamiento para verificar.<br>- No se puede revocar de forma inmediata. | Rechazada |
| Token Opaco (UUID/Hex) en BD | + Permite revocación inmediata.<br>+ Fácil seguimiento de sesiones activas.<br>- Requiere consulta a la BD. | **Elegida**: Permite un logout real y revocar sesiones comprometidas de forma segura. |

### Decision: Configuración de la Cookie
| Flag | Valor / Rationale |
|---|---|
| `httpOnly` | `true`. Evita que scripts maliciosos de JS accedan al token (mitigación XSS). |
| `secure` | `process.env.NODE_ENV === 'production'`. Obligatorio en producción (solo HTTPS), pero permite desarrollo local en HTTP. |
| `sameSite` | `'strict'`. Protege el envío de cookies frente a ataques CSRF (Cross-Site Request Forgery). |

## Data Flow

```
1. Login/Register:
   [Cliente] ──( POST /api/auth/login )──> [Express] ──( Guarda en BD )──> [PostgreSQL]
        │                                      │
        │ <──( 200 OK + JWT Access Token )─────┤
        │ <──( Set-Cookie: refreshToken )──────┘

2. Refresh:
   [Cliente] ──( POST /api/auth/refresh con Cookie )──> [Express] ──( Busca en BD )──> [PostgreSQL]
        │                                                    │
        │ <──( 200 OK + Nuevo JWT Access Token )─────────────┘

3. Logout:
   [Cliente] ──( POST /api/auth/logout con Cookie )──> [Express] ──( Revoca en BD )──> [PostgreSQL]
        │                                                    │
        │ <──( 200 OK + Clear-Cookie )───────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Agregar `cookie-parser` dependency. |
| `prisma/schema.prisma` | Modify | Crear modelo `RefreshToken` y relación con `User`. |
| `src/app.js` | Modify | Registrar middleware `cookie-parser`. |
| `src/controllers/auth.controller.js` | Modify | Ajustar expiración de access token a 15m; agregar cookies y métodos `refresh` y `logout`. |
| `src/routes/auth.routes.js` | Modify | Agregar rutas `/auth/refresh` y `/auth/logout`. |
| `Test-Api.ps1` | Modify | Validaciones de integración de refresh y logout. |

## Interfaces / Contracts

### Refresh Token Database Model (Prisma)
```prisma
model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  expiresAt DateTime
  revokedAt DateTime?
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("refresh_tokens")
}
```

### Endpoints Contracts
* **POST /api/auth/refresh**:
  * Request: Cookie `refreshToken`
  * Response (200): `{ "token": "new-access-token" }`
  * Response (401): `{ "error": "No autorizado", "message": "Sesión expirada o inválida" }`

* **POST /api/auth/logout**:
  * Request: Cookie `refreshToken`
  * Response (200): `{ "message": "Sesión cerrada correctamente" }`

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `auth.controller.js` | Mockear Prisma Client y simular cookies para verificar emisión, expiración y revocación. |
| Integration | `Test-Api.ps1` | Login exitoso -> Verificar cookie inyectada -> Ejecutar refresco -> Validar expiración -> Probar logout y posterior rechazo de refresco. |

## Migration / Rollout

Se requiere ejecutar una migración de Prisma:
```bash
pnpm prisma migrate dev --name add_refresh_tokens
```

## Open Questions
None
