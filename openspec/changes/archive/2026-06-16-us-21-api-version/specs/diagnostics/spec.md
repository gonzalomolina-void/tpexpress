# Delta for diagnostics

## MODIFIED Requirements

### Requirement: Health Check Endpoint

El sistema MUST proveer un endpoint público para verificar la disponibilidad de la API y retornar información de versión y metadata básica.
(Previously: El sistema MUST proveer un endpoint público para verificar la disponibilidad de la API.)

#### Scenario: Successful Health Check
- GIVEN que el servidor está encendido y funcionando correctamente
- WHEN se realiza una petición GET a `/api/health`
- THEN el sistema MUST retornar un estado 200 OK
- AND un body JSON que MUST contener el campo `status` con valor `"ok"`, y los campos `name`, `version` y `description` con los valores correspondientes leídos de `package.json` en runtime.
