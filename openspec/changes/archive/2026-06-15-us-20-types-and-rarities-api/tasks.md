# Tasks: us-20-types-and-rarities-api

## Fase 1: Infraestructura y Mocking

- [x] 1.1 Modificar `src/prisma/__mocks__/prismaClient.js` para agregar el mock de la función `findMany` en `cardType` y `rarity`.

## Fase 2: Servicio de Tipos (useCardForm / useCardForm.test.js)

- [x] 2.1 (TDD - Rojo): Crear `tests/type.service.test.js` testeando que `getTypes` devuelva los tipos mapeados en el idioma seleccionado, maneje fallback a `es` y propague errores.
- [x] 2.2 (TDD - Verde): Crear `src/services/type.service.js` con la consulta Prisma e i18n para pasar la prueba de servicio.

## Fase 3: Servicio de Rarezas

- [x] 3.1 (TDD - Rojo): Crear `tests/rarity.service.test.js` testeando que `getRarities` devuelva las rarezas mapeadas en el idioma seleccionado, maneje fallback a `es` y propague errores.
- [x] 3.2 (TDD - Verde): Crear `src/services/rarity.service.js` con la consulta Prisma e i18n para pasar la prueba de servicio.

## Fase 4: Controlador y Rutas de Tipos

- [x] 4.1 (TDD - Rojo): Crear `tests/type.controller.test.js` validando que `getAllTypes` devuelva código 200 con la respuesta del servicio, use el idioma correcto del request y maneje errores.
- [x] 4.2 (TDD - Verde): Crear `src/controllers/type.controller.js` and `src/routes/type.routes.js` con la lógica y ruteo protegidos.

## Fase 5: Controlador y Rutas de Rarezas

- [x] 5.1 (TDD - Rojo): Crear `tests/rarity.controller.test.js` validando que `getAllRarities` devuelva código 200 con la respuesta del servicio, use el idioma correcto del request y maneje errores.
- [x] 5.2 (TDD - Verde): Crear `src/controllers/rarity.controller.js` y `src/routes/rarity.routes.js` con la lógica y ruteo protegidos.

## Fase 6: Cableado y Verificación de Integración

- [x] 6.1 Modificar `src/app.js` para registrar los nuevos enrutadores `typeRoutes` y `rarityRoutes` bajo `/api`.
- [x] 6.2 Correr toda la suite de pruebas del backend (`pnpm test`) para certificar que todo el código nuevo y existente pase exitosamente.
- [x] 6.3 Validar integración manual levantando la base de datos (Docker) y el backend, testeando `GET /api/types` y `GET /api/rarities` con autenticación mediante Bruno o Curl.

## Fase 7: Entregables de Integración y Documentación

- [x] 7.1 Agregar los endpoints `GET /api/types` y `GET /api/rarities` con sus respectivos esquemas en `docs/swagger.json`.
- [x] 7.2 Crear las requests de colección en Bruno (`bruno/Types/Get Types.bru` y `bruno/Rarities/Get Rarities.bru`) configurando parámetros y cabeceras de internacionalización y autenticación.
- [x] 7.3 Extender el script de pruebas de integración global (`Test-Api.ps1`) agregando los casos de prueba de integración de TC-30 a TC-35.
- [x] 7.4 Ejecutar el script `Test-Api.ps1` exitosamente para garantizar que todas las pruebas pasen en verde.
