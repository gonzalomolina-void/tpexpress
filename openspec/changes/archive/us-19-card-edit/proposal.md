# Propuesta de Cambio: us-19-card-edit (Endpoint de Consulta Completa de Carta para Edición)

## 1. Visión General y Propósito
El objetivo de este cambio es proveer un nuevo endpoint protegido en el backend, `GET /api/cards/:id/edit`, que devuelva todos los datos de una carta con sus traducciones estructuradas por idioma (sin aplanar). Esto permitirá que el frontend de administración cargue los datos de la carta en todos los idiomas de forma simultánea en la grilla editable de traducciones.

## 2. Enfoque de Diseño y Arquitectura
- **Rutas (`src/routes/card.routes.js`)**:
  - Declarar el endpoint `GET /cards/:id/edit`.
  - Proteger la ruta usando los middlewares existentes `requireAuth` y `requireRole(ROLES.ADMIN)`.
- **Controlador (`src/controllers/card.controller.js`)**:
  - Implementar la función `getCardForEdit` que maneje la petición.
  - Validar que el parámetro `:id` sea un entero válido (retornar `400 Bad Request` en caso contrario).
  - Invocar `cardService.getCardById(id)` para obtener el registro relacional completo de la carta.
  - Si no existe la carta, retornar `404 Not Found`.
  - Mapear el resultado de la consulta de Prisma al formato de diccionario indexado requerido por el cliente:
    ```json
    {
      "id": 1,
      "cost": 3,
      "atk": 4,
      "def": 5,
      "image": "/cards/SirKaelen.png",
      "typeCode": "creature",
      "rarityCode": "common",
      "translations": {
        "es": { "name": "Sir Kaelen", "description": "Un caballero leal..." },
        "en": { "name": "Sir Kaelen", "description": "A loyal knight..." }
      }
    }
    ```
  - Retornar status `200 OK` con el objeto mapeado.

## 3. Impacto en Pruebas
- **Tests Unitarios/Integración (`tests/card.controller.test.js`)**:
  - Agregar un test suite para `getCardForEdit`:
    - Validar acceso restringido (debe retornar `401` si no hay token y `403` si el rol no es admin).
    - Validar comportamiento con ID inválido (`400 Bad Request`).
    - Validar comportamiento con ID inexistente (`404 Not Found`).
    - Validar que con un ID válido y rol admin, retorne `200 OK` y el JSON estructurado de forma correcta con `translations` indexado.

## 4. Riesgos y Mitigación
- **Riesgo:** Exposición accidental de datos sensibles o acceso no autorizado.
- **Mitigación:** Asegurar que los middlewares `requireAuth` y `requireRole` actúen antes del controlador.
- **Riesgo:** Inconsistencias con ids que no son enteros.
- **Mitigación:** Validar explícitamente `parseInt(req.params.id, 10)` y responder apropiadamente.

## 5. Plan de Rollback
En caso de falla crítica, se restaurará el estado anterior del repositorio con:
```bash
git checkout main
git branch -D feat/us-19-card-edit
```
