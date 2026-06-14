# Lista de Tareas: us-19-card-edit (Endpoint de Consulta Completa de Carta para Edición)

## 1. Preparación y Utilerías
- [ ] **Task 1.1**: Implementar la función `mapCardForEdit(card)` en `src/utils/i18n.js` que reciba el objeto de Prisma y retorne la carta con el diccionario de traducciones indexado por idioma (`translations: { es: {...}, en: {...} }`) y los códigos paramétricos (`typeCode`, `rarityCode`).
- [ ] **Task 1.2**: Exportar `mapCardForEdit` en `src/utils/i18n.js`.

## 2. Desarrollo del Controlador y Rutas (TDD - Fase RED/GREEN)
- [ ] **Task 2.1**: Escribir los tests unitarios en `tests/card.controller.test.js` para el nuevo endpoint `GET /api/cards/:id/edit` que validen:
  - Acceso rechazado por falta de autenticación (status 401).
  - Acceso rechazado para rol no administrador (status 403).
  - ID de carta no numérico (status 400).
  - Carta no encontrada en base de datos (status 404).
  - Respuesta exitosa con formato correcto (status 200, diccionario indexado por idioma).
  *(Nota: Al correr los tests inicialmente, fallarán, disparando la fase RED de TDD).*
- [ ] **Task 2.2**: Implementar la función controladora `getCardForEdit` en `src/controllers/card.controller.js` que maneje la validación del ID, llame a `cardService.getCardById(id)` y aplique el formateador.
- [ ] **Task 2.3**: Registrar la ruta `GET /cards/:id/edit` protegida por `requireAuth` y `requireRole(ROLES.ADMIN)` en `src/routes/card.routes.js`.
  *(Nota: Al completar esto, los tests unitarios deben pasar con éxito, fase GREEN de TDD).*

## 3. Validación y Pruebas
- [ ] **Task 3.1**: Correr la suite completa de pruebas unitarias usando `pnpm test` para asegurar un 100% de éxito y cero regresiones.
- [ ] **Task 3.2**: Correr el script de validación de API en PowerShell (`./Test-Api.ps1`) para verificar que el servidor levante correctamente y responda sobre la red real de Docker.

## 4. Cierre y Sincronización
- [ ] **Task 4.1**: Copiar los archivos modificados del backend a la carpeta vecina `..\pwatpo1node` para sincronizar los cambios de node.
- [ ] **Task 4.2**: Realizar commit convencional con la firma de conventional commits y hacer push de la rama `feat/us-19-card-edit` a remoto.
