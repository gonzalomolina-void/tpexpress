# Delta for Favorites

## ADDED Requirements

### Requirement: Add Favorite Card
El sistema MUST permitir a un usuario autenticado agregar una carta a su listado de favoritos. Si la carta ya se encuentra en sus favoritos, el sistema MUST retornar un error con estado `409 Conflict`.

#### Scenario: Successful Favorite Creation
- GIVEN un usuario autenticado y una carta existente que no está en sus favoritos
- WHEN se realiza una petición POST a `/api/favorites` con el ID de la carta en el cuerpo de la request
- THEN el sistema MUST agregar la carta a los favoritos del usuario
- AND retornar un estado 201 Created

#### Scenario: Duplicate Favorite Creation
- GIVEN un usuario autenticado y una carta existente que ya está en sus favoritos
- WHEN se realiza una petición POST a `/api/favorites` con el ID de la carta en el cuerpo de la request
- THEN el sistema MUST denegar el registro
- AND retornar un estado 409 Conflict

## MODIFIED Requirements

### Requirement: Remove Favorite Card by ID
El sistema MUST permitir a un usuario autenticado eliminar una carta de su listado de favoritos utilizando el parámetro `:id` en la ruta de eliminación. Si la carta no se encuentra en la lista de favoritos del usuario, el sistema MUST retornar un error con estado `404 Not Found`.
(Previously: El sistema no validaba si la relación de favoritos existía antes de eliminar y respondía 200 OK de forma incondicional.)

#### Scenario: Successful Favorite Deletion
- GIVEN un usuario autenticado con una carta con ID `10` en su lista de favoritos
- WHEN se realiza una petición DELETE a `/api/favorites/10` con el token de acceso válido
- THEN el sistema MUST eliminar la asociación de favoritos
- AND retornar un estado 200 OK
- AND retornar un mensaje de éxito indicando que la carta fue eliminada correctamente

#### Scenario: Deletion with Invalid ID Parameter
- GIVEN un usuario autenticado
- WHEN se realiza una petición DELETE a `/api/favorites/abc`
- THEN el sistema MUST retornar un estado 400 Bad Request
- AND retornar un mensaje indicando que el ID de la carta no es válido

#### Scenario: Deletion of Non-Existent Favorite
- GIVEN un usuario autenticado y una carta con ID `20` que no está en su lista de favoritos
- WHEN se realiza una petición DELETE a `/api/favorites/20` con el token de acceso válido
- THEN el sistema MUST denegar la eliminación
- AND retornar un estado 404 Not Found
