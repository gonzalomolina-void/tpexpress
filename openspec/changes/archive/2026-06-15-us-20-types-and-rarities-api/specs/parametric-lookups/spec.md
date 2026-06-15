# Specification: Parametric Lookups

## Purpose
Este dominio define la especificación para los endpoints del backend que proveen catálogos y metadatos paramétricos del juego (como tipos de cartas y rarezas), permitiendo a los clientes consumirlos dinámicamente con soporte de traducción bilingüe.

## Requirements

### Requirement: Obtención de Tipos de Cartas (GET /api/types)

El sistema MUST exponer el endpoint `GET /api/types` para obtener todos los tipos de cartas disponibles en la base de datos:
- Las peticiones MUST estar protegidas por el middleware de autenticación de usuario.
- Los tipos devueltos MUST estar traducidos dinámicamente de acuerdo a la preferencia de idioma del cliente (`lang=es` o `lang=en` en el query, o cabecera `Accept-Language`), haciendo fallback a Español (`es`) si no hay especificación.
- Cada objeto tipo devuelto MUST incluir: `id` (entero), `code` (código de texto string), `name` (nombre localizado traducido) y `labelKey` (clave de i18n para retrocompatibilidad).

#### Scenario: Obtener tipos exitosamente en Español
- **GIVEN** un usuario autenticado realizando una petición a `GET /api/types`
- **WHEN** envía el query parameter `lang=es` (o cabecera `Accept-Language: es`)
- **THEN** el sistema MUST responder con código `200 OK`
- **AND** un JSON conteniendo una lista con los tipos mapeados:
  ```json
  [
    { "id": 1, "code": "creature", "name": "Criatura", "labelKey": "card.types.creature" },
    { "id": 2, "code": "spell", "name": "Hechizo", "labelKey": "card.types.spell" },
    { "id": 3, "code": "artifact", "name": "Artefacto", "labelKey": "card.types.artifact" }
  ]
  ```

#### Scenario: Obtener tipos exitosamente en Inglés
- **GIVEN** un usuario autenticado realizando una petición a `GET /api/types`
- **WHEN** envía el query parameter `lang=en` (o cabecera `Accept-Language: en`)
- **THEN** el sistema MUST responder con código `200 OK`
- **AND** un JSON conteniendo una lista con los tipos mapeados al inglés:
  ```json
  [
    { "id": 1, "code": "creature", "name": "Creature", "labelKey": "card.types.creature" },
    { "id": 2, "code": "spell", "name": "Spell", "labelKey": "card.types.spell" },
    { "id": 3, "code": "artifact", "name": "Artifact", "labelKey": "card.types.artifact" }
  ]
  ```

#### Scenario: Intento de consulta de tipos sin autenticación
- **GIVEN** un cliente no autenticado realizando una petición a `GET /api/types`
- **WHEN** se procesa la solicitud
- **THEN** el sistema MUST rechazar la petición con un código `401 Unauthorized`
- **AND** devolver un error de credenciales inválidas.

---

### Requirement: Obtención de Rarezas (GET /api/rarities)

El sistema MUST exponer el endpoint `GET /api/rarities` para obtener todas las rarezas de cartas disponibles en la base de datos:
- Las peticiones MUST estar protegidas por el middleware de autenticación de usuario.
- Las rarezas devueltas MUST estar traducidas dinámicamente de acuerdo a la preferencia de idioma del cliente, haciendo fallback a Español (`es`) si no hay especificación.
- Cada objeto rareza devuelto MUST incluir: `id` (entero), `code` (código de texto string), `name` (nombre localizado traducido) y `labelKey` (clave de i18n para retrocompatibilidad).

#### Scenario: Obtener rarezas exitosamente en Español
- **GIVEN** un usuario autenticado realizando una petición a `GET /api/rarities`
- **WHEN** envía el query parameter `lang=es` (o cabecera `Accept-Language: es`)
- **THEN** el sistema MUST responder con código `200 OK`
- **AND** un JSON conteniendo una lista con las rarezas mapeadas:
  ```json
  [
    { "id": 1, "code": "poor", "name": "Pobre", "labelKey": "card.rarities.poor" },
    { "id": 2, "code": "common", "name": "Común", "labelKey": "card.rarities.common" },
    { "id": 3, "code": "uncommon", "name": "Poco Común", "labelKey": "card.rarities.uncommon" },
    { "id": 4, "code": "rare", "name": "Raro", "labelKey": "card.rarities.rare" },
    { "id": 5, "code": "epic", "name": "Épico", "labelKey": "card.rarities.epic" },
    { "id": 6, "code": "legendary", "name": "Legendario", "labelKey": "card.rarities.legendary" }
  ]
  ```

#### Scenario: Obtener rarezas exitosamente en Inglés
- **GIVEN** un usuario autenticado realizando una petición a `GET /api/rarities`
- **WHEN** envía el query parameter `lang=en` (o cabecera `Accept-Language: en`)
- **THEN** el sistema MUST responder con código `200 OK`
- **AND** un JSON conteniendo una lista con las rarezas mapeadas al inglés:
  ```json
  [
    { "id": 1, "code": "poor", "name": "Poor", "labelKey": "card.rarities.poor" },
    { "id": 2, "code": "common", "name": "Common", "labelKey": "card.rarities.common" },
    { "id": 3, "code": "uncommon", "name": "Uncommon", "labelKey": "card.rarities.uncommon" },
    { "id": 4, "code": "rare", "name": "Rare", "labelKey": "card.rarities.rare" },
    { "id": 5, "code": "epic", "name": "Epic", "labelKey": "card.rarities.epic" },
    { "id": 6, "code": "legendary", "name": "Legendary", "labelKey": "card.rarities.legendary" }
  ]
  ```

#### Scenario: Intento de consulta de rarezas sin autenticación
- **GIVEN** un cliente no autenticado realizando una petición a `GET /api/rarities`
- **WHEN** se procesa la solicitud
- **THEN** el sistema MUST rechazar la petición con un código `401 Unauthorized`
- **AND** devolver un error de credenciales inválidas.
