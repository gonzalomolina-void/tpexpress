# User Auth Refresh Tokens Specification

## Purpose

Definir los requisitos de seguridad y comportamiento para la persistencia de sesiones de usuario mediante Refresh Tokens almacenados en cookies HTTP httpOnly y base de datos.

## Requirements

### Requirement: Session Initialization
Al iniciar sesión exitosamente, el sistema MUST emitir un Access Token de corta duración y un Refresh Token de larga duración persistido en base de datos. El Refresh Token MUST enviarse mediante una cookie httpOnly, segura y con SameSite=Strict.

#### Scenario: Successful Login
- GIVEN un usuario registrado existente con credenciales válidas
- WHEN el usuario realiza un POST a `/api/auth/login` con sus credenciales válidas
- THEN el sistema MUST responder con status 200
- AND retornar el Access Token en el body JSON
- AND inyectar una cookie `refreshToken` con los flags httpOnly, Secure y SameSite=Strict

---

### Requirement: Token Refresh
El sistema MUST permitir la obtención de un nuevo Access Token válido presentando un Refresh Token válido y no revocado.

#### Scenario: Successful Token Refresh
- GIVEN un usuario con una cookie `refreshToken` válida almacenada en la base de datos
- WHEN el usuario realiza un POST a `/api/auth/refresh`
- THEN el sistema MUST retornar status 200
- AND un nuevo Access Token en el body JSON

#### Scenario: Expired or Revoked Refresh Token
- GIVEN una cookie `refreshToken` que ha expirado o ha sido revocada en la base de datos
- WHEN el usuario realiza un POST a `/api/auth/refresh`
- THEN el sistema MUST retornar status 401 Unauthorized
- AND un mensaje indicando que la sesión ha expirado

---

### Requirement: Session Invalidation (Logout)
Al cerrar sesión, el sistema MUST revocar el Refresh Token en la base de datos y eliminar la cookie del navegador del cliente.

#### Scenario: Successful Logout
- GIVEN un usuario autenticado con una cookie `refreshToken` activa
- WHEN el usuario realiza un POST a `/api/auth/logout`
- THEN el sistema MUST retornar status 200
- AND marcar el token como revocado en la base de datos
- AND borrar la cookie `refreshToken` del cliente

---

### Requirement: Get Current Authenticated User
El sistema MUST permitir la obtención de los datos del usuario actualmente autenticado mediante su token de acceso JWT.

#### Scenario: Successful Retrieve Profile
- GIVEN un usuario autenticado con un token de acceso válido en la cabecera `Authorization: Bearer <token>`
- WHEN el usuario realiza un GET a `/api/auth/me`
- THEN el sistema MUST retornar un estado 200 OK
- AND retornar los datos del usuario en el body JSON (ID, email, y rol aplanado)
- AND no incluir el campo password en la respuesta

---

### Requirement: User Registration
El sistema MUST permitir el registro de un nuevo usuario mediante un email único y contraseña. Si el email ya está registrado, el sistema MUST retornar un error con estado `409 Conflict`.

#### Scenario: Successful Registration
- GIVEN un email que no existe en el sistema
- WHEN se realiza una petición POST a `/api/auth/register` con nombre, email y contraseña válidos
- THEN el sistema MUST guardar el usuario con la contraseña hasheada
- AND retornar un estado 201 Created
- AND el objeto del usuario sin el campo password

#### Scenario: Duplicate Email Registration
- GIVEN un usuario registrado existente con el email "dup@example.com"
- WHEN se realiza una petición POST a `/api/auth/register` con el mismo email "dup@example.com"
- THEN el sistema MUST denegar la creación
- AND retornar un estado 409 Conflict
- AND un mensaje de error indicando que el email ya está registrado
