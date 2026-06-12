# Diagnostics Specification

## Purpose
Definir los endpoints de diagnóstico y salud del servidor para monitoreo externo.

## Requirements

### Requirement: Health Check Endpoint
El sistema MUST proveer un endpoint público para verificar la disponibilidad de la API.

#### Scenario: Successful Health Check
- GIVEN que el servidor está encendido y funcionando correctamente
- WHEN se realiza una petición GET a `/api/health`
- THEN el sistema MUST retornar un estado 200 OK
- AND un body JSON con `{ "status": "ok", "message": "API funcionando correctamente" }`
