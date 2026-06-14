# Especificación de Requerimientos: us-19-card-edit (Endpoint de Consulta Completa de Carta para Edición)

## 1. Requerimientos Funcionales
El endpoint `GET /api/cards/:id/edit` debe permitir que los administradores consulten la información completa de una carta para su posterior edición, manteniendo las traducciones estructuradas por idioma para evitar aplanamiento de datos.

## 2. Escenarios de Aceptación (Gherkin/TDD)

### Escenario 1: Obtención exitosa de carta para edición por un administrador
- **Given** Un usuario autenticado con rol `admin`.
- **And** Una carta existente en la base de datos con ID `1` (con traducciones en español e inglés).
- **When** Se realiza una petición HTTP `GET` a `/api/cards/1/edit` enviando el token JWT del administrador en la cabecera `Authorization`.
- **Then** El servidor debe retornar un código de estado `200 OK`.
- **And** El cuerpo de la respuesta debe contener el objeto de la carta en formato JSON estruturado con las traducciones indexadas por idioma:
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

### Escenario 2: Acceso rechazado por falta de autenticación
- **Given** Un cliente no autenticado.
- **When** Se realiza una petición HTTP `GET` a `/api/cards/1/edit` sin cabeceras de autorización.
- **Then** El servidor debe retornar un código de estado `401 Unauthorized` con un mensaje de error estructurado.

### Escenario 3: Acceso rechazado por falta de permisos (rol de usuario común)
- **Given** Un usuario autenticado con rol `usuario`.
- **When** Se realiza una petición HTTP `GET` a `/api/cards/1/edit` con el token JWT del usuario en la cabecera.
- **Then** El servidor debe retornar un código de estado `403 Forbidden` con un mensaje de error estructurado.

### Escenario 4: Carta no encontrada en la base de datos
- **Given** Un usuario autenticado con rol `admin`.
- **When** Se realiza una petición HTTP `GET` a `/api/cards/9999/edit` (donde ID 9999 no existe en la base de datos).
- **Then** El servidor debe retornar un código de estado `404 Not Found` con un mensaje explicativo.

### Escenario 5: ID de carta inválido
- **Given** Un usuario autenticado con rol `admin`.
- **When** Se realiza una petición HTTP `GET` a `/api/cards/xyz/edit` (donde 'xyz' no es un ID válido).
- **Then** El servidor debe retornar un código de estado `400 Bad Request` detallando que el ID provisto es inválido.
