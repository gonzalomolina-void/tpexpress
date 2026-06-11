## Exploration: us16-refresh-tokens

### Current State
El sistema de autenticación actual (`POST /api/auth/login`) genera un único token JWT con una duración de 24 horas y lo devuelve en el cuerpo de la respuesta JSON. El cliente debe almacenar este token y enviarlo en la cabecera `Authorization: Bearer <token>` en cada petición protegida. No existe un mecanismo de renovación automática ni almacenamiento en base de datos para la revocación o cierre de sesión, y la sesión expira abruptamente tras las 24 horas si no se vuelve a ingresar credenciales.

### Affected Areas
- `prisma/schema.prisma` — Creación del modelo `RefreshToken` y su relación con `User`.
- `src/controllers/auth.controller.js` — Modificación del login/registro para emitir Access Token (corta duración) y guardar/iniciar Cookie del Refresh Token; creación de controladores para `/auth/refresh` y `/auth/logout`.
- `src/routes/auth.routes.js` — Registro de rutas para refrescar sesión (`/auth/refresh`) y cerrar sesión (`/auth/logout`).
- `src/app.js` — Configuración del middleware de cookies `cookie-parser` y habilitar `credentials: true` en CORS.
- `package.json` — Adición de la dependencia `cookie-parser`.
- `docs/swagger.json` — Registro de nuevos endpoints de autenticación y actualización del esquema de cookies.
- `Test-Api.ps1` — Agregar casos de prueba de integración para `/auth/refresh`, expiración y `/auth/logout`.

### Approaches
1. **Opción A: Refresh Token en Cookie httpOnly (Recomendado)** — El backend inyecta una cookie segura de solo lectura HTTP que contiene el Refresh Token. El Access Token sigue viniendo en el body del login/refresh.
   - Pros: Máxima seguridad contra ataques XSS; los navegadores manejan el envío de la cookie de forma automática.
   - Cons: Requiere instalar `cookie-parser` y habilitar `credentials: true` en CORS.
   - Effort: Medium

2. **Opción B: Refresh Token en JSON Body** — Se retornan ambos tokens en el body de la respuesta JSON, y el cliente es responsable de almacenarlo (ej: localStorage).
   - Pros: Implementación directa sin tocar CORS o middlewares de cookies.
   - Cons: Vulnerable a robos por XSS si el token queda expuesto en localStorage.
   - Effort: Low

### Recommendation
Se recomienda la **Opción A (Cookie httpOnly)**. Al tratarse de un sistema con base de datos real (PostgreSQL), la seguridad en el manejo de sesiones es crítica y justifica la mínima complejidad adicional de configurar CORS y el analizador de cookies.

### Risks
- Colisiones en CORS: Si el frontend se despliega en otro dominio, la configuración de `credentials: true` requerirá orígenes explícitamente listados en lugar de comodines (`*`). Sin embargo, el proyecto ya expone un puerto controlado localmente (`http://localhost:5173`) lo cual lo hace viable.
- Manejo de sesiones concurrentes: El diseño debe contemplar si un usuario puede tener múltiples Refresh Tokens activos (por ejemplo, en diferentes dispositivos) o si cada login invalida los anteriores. Proponemos permitir múltiples dispositivos (relación de uno a muchos entre `User` y `RefreshToken`).

### Ready for Proposal
Yes — La exploración está lista. Podemos proceder a la fase de propuesta para detallar el plan de implementación de las cookies y base de datos.
