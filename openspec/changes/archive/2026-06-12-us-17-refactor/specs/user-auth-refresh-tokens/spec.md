# Delta for User Auth Refresh Tokens

## ADDED Requirements

### Requirement: Get Current Authenticated User
El sistema MUST permitir la obtención de los datos del usuario actualmente autenticado mediante su token de acceso JWT.

#### Scenario: Successful Retrieve Profile
- GIVEN un usuario autenticado con un token de acceso válido en la cabecera `Authorization: Bearer <token>`
- WHEN el usuario realiza un GET a `/api/auth/me`
- THEN el sistema MUST retornar un estado 200 OK
- AND retornar los datos del usuario en el body JSON (ID, email, y rol aplanado)
- AND no incluir el campo password en la respuesta
