# Delta for User Auth Refresh Tokens

## MODIFIED Requirements

### Requirement: Session Initialization
Al iniciar sesión exitosamente, el sistema MUST emitir un Access Token de corta duración y un Refresh Token de larga duración persistido en base de datos, y retornar la información del usuario autenticado incluyendo su perfil.
(Previously: Al iniciar sesión exitosamente, el sistema MUST emitir un Access Token de corta duración y un Refresh Token de larga duración persistido en base de datos.)

#### Scenario: Successful Login
- GIVEN un usuario registrado existente con credenciales válidas
- WHEN el usuario realiza un POST a `/api/auth/login` con sus credenciales válidas
- THEN el sistema MUST responder con status 200
- AND retornar el Access Token y el objeto del usuario incluyendo su objeto `profile` en el body JSON
- AND inyectar una cookie `refreshToken` con los flags httpOnly, Secure y SameSite=Strict

---

### Requirement: Get Current Authenticated User
El sistema MUST permitir la obtención de los datos del usuario actualmente autenticado mediante su token de acceso JWT, incluyendo sus preferencias de perfil.
(Previously: El sistema MUST permitir la obtención de los datos del usuario actualmente autenticado mediante su token de acceso JWT.)

#### Scenario: Successful Retrieve Profile
- GIVEN un usuario autenticado con un token de acceso válido en la cabecera `Authorization: Bearer <token>`
- WHEN el usuario realiza un GET a `/api/auth/me`
- THEN el sistema MUST retornar un estado 200 OK
- AND retornar los datos del usuario en el body JSON, incluyendo su objeto `profile` conteniendo `darkMode` y `language`
- AND no incluir el campo password en la respuesta
