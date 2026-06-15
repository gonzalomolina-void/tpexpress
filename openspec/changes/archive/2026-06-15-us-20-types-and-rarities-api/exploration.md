# Exploración: us-20-types-and-rarities-api

Este documento detalla la investigación y el análisis de la arquitectura del backend en `tpexpress` para exponer los endpoints de consulta de tipos de cartas (`GET /api/types`) y rarezas (`GET /api/rarities`) con soporte multi-idioma (i18n).

---

## 1. Estado Actual (Current State)
- El backend en `tpexpress` está construido sobre **Node.js, Express, Prisma ORM (PostgreSQL)** y utiliza **ES Modules**.
- En la base de datos (según `schema.prisma`), las tablas `card_types` y `rarities` ya se encuentran modeladas e incluyen relaciones de traducción (`card_type_translations` y `rarity_translations`) para soporte bilingüe (`es` y `en`), y se siembran con datos en `seed.js`.
- Actualmente **no existen endpoints** expuestos para consultar estas tablas paramétricas.
- El frontend en `pwatpo2react2` tiene estas opciones hardcodeadas como constantes estáticas (`CARD_TYPES` y `CARD_RARITIES` en `src/constants/cardConstants.js`), limitando la capacidad de agregar nuevos tipos o rarezas de forma dinámica en la base de datos sin redesplegar el cliente.

---

## 2. Áreas Afectadas (Affected Areas)
- **Rutas (Routes):**
  - `src/routes/type.routes.js` (Nuevo) — Define la ruta `/types` con protección de autenticación.
  - `src/routes/rarity.routes.js` (Nuevo) — Define la ruta `/rarities` con protección de autenticación.
  - `src/app.js` (Modificado) — Registra los nuevos enrutadores bajo el prefijo `/api`.
- **Controladores (Controllers):**
  - `src/controllers/type.controller.js` (Nuevo) — Procesa la petición `/types`, resuelve el idioma del usuario y delega al servicio.
  - `src/controllers/rarity.controller.js` (Nuevo) — Procesa la petición `/rarities`, resuelve el idioma del usuario y delega al servicio.
- **Servicios (Services):**
  - `src/services/type.service.js` (Nuevo) — Ejecuta la consulta Prisma para obtener los tipos y sus traducciones.
  - `src/services/rarity.service.js` (Nuevo) — Ejecuta la consulta Prisma para obtener las rarezas y sus traducciones.
- **Pruebas (Tests):**
  - `tests/type.controller.test.js` (Nuevo) — Pruebas unitarias para el controlador de tipos.
  - `tests/rarity.controller.test.js` (Nuevo) — Pruebas unitarias para el controlador de rarezas.
  - `tests/type.service.test.js` (Nuevo) — Pruebas unitarias para el servicio de tipos.
  - `tests/rarity.service.test.js` (Nuevo) — Pruebas unitarias para el servicio de rarezas.

---

## 3. Enfoques Analizados (Approaches)

### Enfoque 1: Modularidad Limpia por Recursos (Recomendado)
Crear enrutadores, controladores y servicios dedicados para `/types` y `/rarities` de forma separada, replicando el patrón de `/cards` y `/favorites`.
- **Pros:**
  - Cumple estrictamente con el principio de responsabilidad única (SRP).
  - Facilidad de extensión si en el futuro se implementan operaciones ABM (Alta, Baja, Modificación) para tipos y rarezas desde el panel de administración.
  - Facilita la creación de tests unitarios aislados y legibles.
- **Cons:**
  - Requiere crear más archivos individuales en el proyecto backend.
- **Esfuerzo:** Medio.

### Enfoque 2: Agrupación en Enrutador Paramétrico Único
Crear un único enrutador y controlador `parametric.routes.js` y `parametric.controller.js` para exponer ambos endpoints.
- **Pros:**
  - Reduce la cantidad de archivos creados en el codebase.
  - Centraliza endpoints de consulta de catálogos paramétricos secundarios.
- **Cons:**
  - Mezcla responsabilidades de entidades distintas (`CardType` y `Rarity`) en un solo archivo.
- **Esfuerzo:** Bajo.

---

## 4. Recomendación (Recommendation)
Se recomienda el **Enfoque 1 (Modularidad Limpia por Recursos)**. El proyecto backend de Express sigue una estructura muy limpia donde cada recurso de la base de datos posee su propio enrutador, controlador y servicio (ej: `favorite.routes.js`, `favorite.controller.js`, `favorite.service.js`). Mantener este estándar de diseño facilita el mantenimiento por parte del equipo y deja una arquitectura limpia y escalable.

---

## 5. Riesgos (Risks)
- **Consistencia del Idioma (i18n):**
  Las traducciones deben devolverse en el idioma de preferencia del usuario (`Accept-Language` o `?lang=`), emulando el comportamiento ya existente en el controlador de cartas. Si no existe traducción en el idioma pedido, se debe hacer fallback a Español (`es`).
- **Seguridad y Acceso:**
  Dado que el catálogo principal de cartas requiere sesión activa, estos endpoints también deben estar protegidos con el middleware `requireAuth` para evitar fugas de datos y llamadas no autenticadas.

---

## 6. Listo para Propuesta (Ready for Proposal)
**Sí**. Estamos listos para proceder con la propuesta técnica detallada en la fase `proposal`.
