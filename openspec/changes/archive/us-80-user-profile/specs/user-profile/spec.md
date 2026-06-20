# User Profile Specification

## Purpose

Definir los requisitos funcionales para el almacenamiento y la recuperación de preferencias de usuario (tales como modo oscuro e idioma) asociadas de forma uno a uno con el usuario.

## Requirements

### Requirement: Get User Profile
El sistema MUST permitir a cualquier usuario autenticado obtener sus preferencias de perfil actuales.

#### Scenario: Successfully Retrieve User Profile
- GIVEN un usuario autenticado con un token de acceso válido
- WHEN realiza una petición GET a `/api/profile`
- THEN el sistema MUST retornar un estado 200 OK
- AND retornar un objeto JSON con las propiedades `darkMode` (booleano) y `language` (string, "es" o "en")

---

### Requirement: Update User Profile
El sistema MUST permitir a cualquier usuario autenticado actualizar sus preferencias de perfil mediante una validación estricta de tipos de datos.

#### Scenario: Successfully Update Profile Preferences
- GIVEN un usuario autenticado con un token de acceso válido
- WHEN realiza una petición PUT a `/api/profile` con `darkMode: true` y `language: "en"`
- THEN el sistema MUST persistir los cambios en la base de datos
- AND retornar un estado 200 OK
- AND retornar el perfil actualizado

#### Scenario: Fail Update due to Invalid Language
- GIVEN un usuario autenticado con un token de acceso válido
- WHEN realiza una petición PUT a `/api/profile` con `language: "fr"`
- THEN el sistema MUST rechazar el cambio
- AND retornar un estado 400 Bad Request
- AND un mensaje de error indicando que el idioma indicado es inválido

#### Scenario: Fail Update due to Invalid Data Type
- GIVEN un usuario autenticado con un token de acceso válido
- WHEN realiza una petición PUT a `/api/profile` con `darkMode: "yes"`
- THEN el sistema MUST rechazar el cambio
- AND retornar un estado 400 Bad Request
