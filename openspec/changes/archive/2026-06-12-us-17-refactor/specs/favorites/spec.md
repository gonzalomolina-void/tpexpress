# Favorites Specification

## Purpose
Definir el comportamiento del sistema para la gestión de cartas favoritas por parte de los usuarios autenticados.

## Requirements

### Requirement: Remove Favorite Card by ID
El sistema MUST permitir a un usuario autenticado eliminar una carta de su listado de favoritos utilizando el parámetro `:id` en la ruta de eliminación.

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
