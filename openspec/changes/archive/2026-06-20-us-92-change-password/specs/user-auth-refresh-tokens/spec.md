# Delta Spec: User Auth Change Password

## Requirements

### Requirement: Change Password
El sistema MUST permitir a un usuario autenticado cambiar su contraseña actual validando sus credenciales e imponiendo restricciones sobre la nueva clave.

#### Scenario: Successful Password Change
- GIVEN un usuario autenticado con un token de acceso válido
- AND su contraseña actual es "password123"
- WHEN el usuario realiza un PUT a `/api/auth/change-password` con `currentPassword` como "password123" y `newPassword` como "newSecurePassword123"
- THEN el sistema MUST retornar status 200 OK
- AND actualizar la contraseña del usuario hasheándola en la base de datos
- AND retornar un mensaje de éxito indicando que la contraseña fue actualizada

#### Scenario: Incorrect Current Password
- GIVEN un usuario autenticado con un token de acceso válido
- AND su contraseña actual es "password123"
- WHEN el usuario realiza un PUT a `/api/auth/change-password` con `currentPassword` como "wrongPassword" y `newPassword` como "newSecurePassword123"
- THEN el sistema MUST denegar la actualización
- AND retornar status 401 Unauthorized
- AND retornar un mensaje de error indicando que la contraseña actual es incorrecta

#### Scenario: Invalid New Password (Too Short)
- GIVEN un usuario autenticado con un token de acceso válido
- WHEN el usuario realiza un PUT a `/api/auth/change-password` con `currentPassword` como "password123" y `newPassword` como "123"
- THEN el sistema MUST retornar status 400 Bad Request
- AND retornar detalles del error indicando que la nueva contraseña debe tener al menos 6 caracteres
