# Exploration: Ajustes de Seguridad y Códigos de Estado HTTP (s-21-security-adjustments)

### Current State
El backend de la aplicación implementa autenticación mediante JWT y gestión de favoritos asociados al usuario logueado en la base de datos PostgreSQL mediante Prisma ORM. No obstante, existen desvíos de códigos de estado HTTP frente a la especificación de la cátedra:
1. El registro (`POST /api/auth/register`) responde con `400 Bad Request` en lugar de `409 Conflict` cuando el email ya está en uso.
2. La creación de favoritos (`POST /api/favorites`) usa un `upsert` que siempre responde `201 Created` en lugar de validar existencia previa y retornar `409 Conflict` si ya estaba marcado.
3. La eliminación de favoritos (`DELETE /api/favorites/:id`) responde `200 OK` incondicionalmente, incluso cuando el favorito no existía para el usuario, en lugar de retornar `404 Not Found`.

### Affected Areas
- `src/controllers/auth.controller.js` — Retornar `409 Conflict` si el email está duplicado en el registro.
- `src/controllers/favorite.controller.js` — Validar existencia del favorito previo a la creación (`409 Conflict`) y éxito en la eliminación (`404 Not Found`).
- `src/services/favorite.service.js` — Proveer métodos de consulta rápida para relaciones individuales de favoritos.
- `tests/auth.controller.test.js` — Adecuar aserciones de código de estado en test de email registrado.
- `tests/favorite.controller.test.js` — Adecuar/agregar tests para validar códigos de respuesta `409` y `404` en favoritos.

### Approaches
1. **Verificación por Lectura Previa (Select-Before-Insert)** — Realizar consultas selectivas (`findUnique`) antes de escribir para determinar duplicaciones o inexistencias y retornar los códigos semánticos adecuados de la API.
   - Pros: Lógica explícita, desacoplada de la base de datos, sumamente sencilla de mockear en pruebas unitarias.
   - Cons: Requiere un select de ida y vuelta adicional al motor de BD.
   - Effort: Low

2. **Captura de Errores del ORM (Catch Exception)** — Delegar la restricción al motor de la base de datos e interceptar errores de clave duplicada (`P2002`) o registro no encontrado (`P2025`) de Prisma en el catch.
   - Pros: Mayor atomicidad en una única transacción de base de datos.
   - Cons: Depende de códigos internos de excepciones del ORM, complicando el mocking en pruebas unitarias existentes.
   - Effort: Medium

### Recommendation
Recomendamos la **Opción 1** (Verificación por Lectura Previa) debido a que es el estándar utilizado en el resto de la aplicación (por ejemplo, en el registro de usuarios ya se hace un select previo por email antes de insertar). Esto mantiene la consistencia estilística y simplifica la modificación de las suites de prueba de Vitest.

### Risks
- Mismatches en el frontend: El cambio de códigos de error (`400 -> 409` en registro y `200 -> 404` en favoritos) puede descolocar los manejadores de respuesta de Axios/Fetch en React si no están preparados para interceptarlos y mostrar los mensajes correspondientes.

### Ready for Proposal
Yes — La exploración está completada y estamos listos para redactar y formalizar la propuesta (propose phase) una vez que el usuario apruebe este informe.
