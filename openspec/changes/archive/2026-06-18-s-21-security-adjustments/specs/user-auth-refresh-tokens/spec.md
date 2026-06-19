# Delta for User Auth Refresh Tokens

## ADDED Requirements

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
