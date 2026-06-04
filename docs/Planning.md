# Planificación del Proyecto (TP Express & React)

Este documento contiene la planificación del desarrollo del Backend (Node.js, Express, Prisma, PostgreSQL) y la integración del Frontend (React). Los requerimientos han sido desglosados en **Historias de Usuario (User Stories)** con sus respectivos **Criterios de Aceptación** y **Tareas Técnicas**.

---

## Índice de Historias de Usuario

* [US 1: Configuración Inicial del Servidor y Health Check](#us-1-configuración-inicial-del-servidor-y-health-check)
* [US 2: Modelo de Datos, Base de Datos y Migraciones](#us-2-modelo-de-datos-base-de-datos-y-migraciones)
* [US 3: Semillado de la Base de Datos (Seed)](#us-3-semillado-de-la-base-de-datos-seed)
* [US 4: Endpoints de Lectura de la API (GET)](#us-4-endpoints-de-lectura-de-la-api-get)
* [US 5: Endpoints de Escritura de la API con Validación Manual (POST, PUT, DELETE)](#us-5-endpoints-de-escritura-de-la-api-con-validación-manual-post-put-delete)
* [US 6: Variables de Entorno y CORS](#us-6-variables-de-entorno-y-cors)
* [US 9: Despliegue en Producción (Backend, Base de Datos y Frontend)](#us-9-despliegue-en-producción-backend-base-de-datos-y-frontend)
* [US 11: Sistema de Autenticación de Usuarios (Registro/Login con JWT)](#us-11-sistema-de-autenticación-de-usuarios-registrologin-con-jwt)
* [US 12: Endpoints para Gestión de Favoritos Relacionados con el Usuario](#us-12-endpoints-para-gestión-de-favoritos-relacionados-con-el-usuario)
* [US 13: Configuración e Implementación de Pruebas Unitarias](#us-13-configuración-e-implementación-de-pruebas-unitarias)

---

## Historias de Usuario

### US 1: Configuración Inicial del Servidor y Health Check
**Como** desarrollador  
**Quiero** inicializar un proyecto de Node.js con Express y configurar un endpoint de comprobación de estado  
**Para** verificar que el servidor está corriendo adecuadamente y sentar las bases del backend.

* **Criterios de Aceptación:**
  * El proyecto debe inicializarse y poder instalar dependencias con `pnpm install`.
  * Debe poder iniciarse en desarrollo con `pnpm dev` y en producción con `pnpm start`.
  * El endpoint `GET /api/health` debe estar disponible y retornar código `200 OK` con el JSON:
    ```json
    {
      "status": "ok",
      "message": "API funcionando correctamente"
    }
    ```
  * El código del servidor debe estar ordenado en una estructura limpia de directorios (`src/`, `src/routes`, `src/controllers`, etc.).

* **Tareas Técnicas:**
  * Crear `package.json` con los scripts correspondientes (`dev`, `start`).
  * Instalar Express y herramientas de desarrollo (como `nodemon`).
  * Configurar `src/app.js` y `src/index.js`.
  * Implementar la ruta de healthcheck y un controlador asociado.

---

### US 2: Modelo de Datos, Base de Datos y Migraciones
**Como** desarrollador  
**Quiero** definir el modelo de la entidad principal en Prisma y configurar la base de datos PostgreSQL  
**Para** persistir la información de manera estructurada y rastrear los cambios en el esquema.

* **Criterios de Aceptación:**
  * Debe crearse el archivo `schema.prisma` y configurarse para PostgreSQL.
  * Se debe definir el modelo de la entidad principal elegida (la misma de la aplicación React) que incluya al menos: `id`, `createdAt`, `updatedAt` y campos propios.
  * Debe existir un archivo `docker-compose.yml` configurado con servicios para Node LTS y PostgreSQL para el entorno de desarrollo local.
  * Debe ser posible ejecutar las migraciones mediante `pnpm prisma migrate dev`.
  * La carpeta `prisma/migrations` debe estar incluida en el control de versiones (Git).
  * Se debe poder generar el cliente con `pnpm prisma generate`.

* **Tareas Técnicas:**
  * Instalar `@prisma/client` y `prisma` como dependencia de desarrollo.
  * Inicializar Prisma con `npx prisma init`.
  * Crear el archivo `docker-compose.yml` incluyendo los servicios de `postgres` y `node` (versión LTS) configurados para desarrollo local.
  * Definir el modelo de la entidad principal en `schema.prisma`.
  * Ejecutar la migración inicial y verificar la creación de tablas en la base de datos local (levantada mediante Docker).
  * Crear el cliente de Prisma unificado en `src/prisma/prismaClient.js`.


---

### US 3: Semillado de la Base de Datos (Seed)
**Como** desarrollador / tester  
**Quiero** contar con un script de semillado automático  
**Para** poblar la base de datos con suficientes registros iniciales coherentes que faciliten las pruebas del scroll infinito y la paginación.

* **Criterios de Aceptación:**
  * Se debe poder ejecutar el comando `pnpm prisma db seed`.
  * El script debe crear entre 20 y 30 registros coherentes con la temática de la aplicación en la base de datos.
  * El comando de semillado debe estar documentado en el `README.md`.

* **Tareas Técnicas:**
  * Crear el archivo `prisma/seed.js`.
  * Configurar el bloque `"prisma"` en `package.json` con la ruta al script de seed.
  * Implementar la lógica para limpiar la tabla antes de insertar y luego insertar los 20-30 registros simulados utilizando el cliente de Prisma.

---

### US 4: Endpoints de Lectura de la API (GET)
**Como** consumidor de la API  
**Quiero** obtener todas las cartas (con soporte opcional de paginación e internacionalización) o una específica a partir de su ID desde la base de datos  
**Para** poder visualizarlas en la interfaz del cliente adaptándose al paginado del frontend, reduciendo el procesamiento en el cliente y mostrando la información en el idioma correcto.

* **Criterios de Aceptación:**
  * `GET /api/cards` y `GET /api/cards/:id` deben soportar internacionalización (idiomas `'es'` y `'en'`) mediante la **estrategia híbrida**:
    * Se debe buscar el idioma en el query parameter `lang` (ej. `?lang=en`).
    * Si no se provee, se debe buscar en la cabecera HTTP `Accept-Language` (ej. `Accept-Language: en`).
    * Si no se detecta ninguno, se debe usar el idioma por defecto `'es'` (español).
    * La respuesta JSON debe retornar los campos traducidos de forma **aplanada** en el objeto raíz (los campos `name` y `description` de la carta, así como el campo `name` del tipo de carta y de la rareza, deben mapearse directamente según el idioma solicitado, ocultando la estructura interna relacional de traducción).
  * `GET /api/cards` debe retornar los registros de la entidad `Card` con status `200 OK` en formato de array JSON plano.
  * `GET /api/cards` debe soportar paginación opcional utilizando los query parameters `page` (número de página, comenzando en 1) y `limit` (cantidad de elementos por página) emulando el comportamiento de **mockapi.io**:
    * La respuesta del body debe ser un **array JSON plano** (sin envolver en objetos adicionales) conteniendo solo los elementos de la página seleccionada.
    * La respuesta debe incluir el header HTTP **`X-Total-Count`** con el total de registros en la base de datos (para que el frontend calcule el total de páginas).
    * Si no se especifican `page` o `limit`, se debe retornar el listado completo.
  * `GET /api/cards/:id` debe retornar la carta correspondiente al ID indicado con status `200 OK`.
  * Si la carta consultada por ID no existe, se debe responder con status `404 Not Found` y el JSON:
    ```json
    {
      "error": "Recurso no encontrado"
    }
    ```
  * Toda la información debe obtenerse de la base de datos a través de Prisma (no en arrays en memoria ni archivos JSON).
  * Debe existir un endpoint (ej. `/api/docs`) que cargue la interfaz de Swagger UI para documentar y probar interactivamente los endpoints de lectura (`GET /api/cards` y `GET /api/cards/:id`).
  * Los endpoints de lectura deben poder probarse y validarse exitosamente mediante una colección de Bruno.

* **Tareas Técnicas:**
  * Crear las rutas y controladores para las peticiones de lectura (`getAll` y `getById`).
  * En los controladores de lectura, determinar el idioma objetivo buscando en `req.query.lang` o `req.headers['accept-language']`, aplicando `'es'` como fallback por defecto si no son válidos o no están presentes.
  * En el controlador `getAll`, capturar `page` y `limit` desde `req.query`, parseándolos a enteros.
  * Implementar el servicio que consulta a la base de datos usando Prisma:
    * Incluir las relaciones de traducciones para `Card`, `CardType` y `Rarity`.
    * Si hay parámetros de paginación, aplicar `skip: (page - 1) * limit` y `take: limit`.
  * Realizar un conteo total (`count()`) en la base de datos cuando se solicita paginación para poder setear el header `X-Total-Count` en la respuesta.
  * Crear una función utilitaria para mapear y aplanar la respuesta relacional de Prisma al formato de respuesta JSON aplanado esperado por el frontend.
  * Configurar un middleware de manejo de errores global (`src/middlewares/errorHandler.js`) para capturar fallos inesperados y retornar status `500`.
  * Instalar `swagger-ui-express` y `swagger-jsdoc` (o preparar un archivo `swagger.json` estático).
  * Configurar e inicializar Swagger en `src/app.js`.
  * Escribir la especificación OpenAPI de los endpoints de lectura.
  * Crear una colección de Bruno para probar los endpoints de lectura (`GET /api/cards` con internacionalización y paginación, y `GET /api/cards/:id`).

---

### US 5: Endpoints de Escritura de la API con Validación Manual (POST, PUT, DELETE)
**Como** consumidor de la API  
**Quiero** poder crear, modificar y eliminar cartas en la base de datos validando los datos de entrada  
**Para** garantizar la integridad del sistema sin depender de librerías externas de validación.

* **Criterios de Aceptación:**
  * `POST /api/cards` debe crear una carta y responder con status `201 Created`.
  * `PUT /api/cards/:id` debe actualizar una carta existente y responder con status `200 OK`.
  * `DELETE /api/cards/:id` debe eliminar la carta y responder con status `200 OK` o `204 No Content`.
  * Se deben poder crear y actualizar los datos en múltiples idiomas (soportando tanto español `'es'` como inglés `'en'`).
  * Se deben validar los datos del body de forma **manual** (usando JavaScript puro, sin librerías tipo Zod/Joi). Se debe validar:
    * Campos obligatorios presentes.
    * Strings no vacíos.
    * Números válidos.
    * Sentido del negocio y restricciones de opciones limitadas si existieran.
    * Que no se envíen objetos vacíos.
  * Si el body es inválido, se debe retornar status `400 Bad Request` con los detalles específicos de los errores en formato JSON:
    ```json
    {
      "error": "Datos inválidos",
      "details": [
        { "field": "campo", "message": "mensaje descriptivo" }
      ]
    }
    ```
  * Los endpoints de escritura (`POST`, `PUT`, `DELETE`) deben estar documentados en la interfaz interactiva de Swagger UI (ej. `/api/docs`), detallando los esquemas de datos requeridos en el body y los posibles códigos de respuesta (`200`, `201`, `400`, `404`, `500`).
  * Los endpoints de escritura deben poder probarse y validarse exitosamente mediante una colección de Bruno.

* **Tareas Técnicas:**
  * Implementar las funciones de validación manual en `src/validations/card.validation.js`.
  * Crear controladores para `create`, `update` y `delete`.
  * Agregar la validación antes de llamar al servicio de creación/edición.
  * Conectar con Prisma para ejecutar operaciones de persistencia e implementar lógica de manejo del error `404` si el ID a modificar o eliminar no existe en la base de datos.
  * Escribir la especificación OpenAPI de los endpoints de escritura.
  * Crear una colección de Bruno para probar los endpoints de escritura (`POST`, `PUT` y `DELETE`) contemplando flujos de datos correctos e inválidos (errores `400` y `404`).

---

### US 6: Variables de Entorno y CORS
**Como** administrador de la aplicación  
**Quiero** gestionar la configuración del entorno mediante variables y restringir los orígenes permitidos mediante CORS  
**Para** mantener seguras las credenciales y permitir que el frontend se comunique con la API de manera controlada.

* **Criterios de Aceptación:**
  * Debe existir un archivo `.env.example` que declare variables como `DATABASE_URL`, `PORT` y `FRONTEND_URL` sin exponer valores sensibles.
  * El archivo `.env` real debe estar listado en `.gitignore`.
  * Se debe configurar CORS permitiendo peticiones desde la URL indicada en `FRONTEND_URL`.

* **Tareas Técnicas:**
  * Crear `.gitignore` y agregar `.env`.
  * Crear `.env.example` y `.env` con las variables correspondientes.
  * Instalar el paquete `cors`.
  * Registrar el middleware de CORS en Express, vinculándolo dinámicamente con la variable de entorno `FRONTEND_URL`.



### US 9: Despliegue en Producción (Backend, Base de Datos y Frontend)
**Como** usuario final  
**Quiero** acceder a la aplicación web a través de URLs públicas estables  
**Para** interactuar con la versión de producción sin depender de entornos locales.

* **Criterios de Aceptación:**
  * El backend de la API debe estar desplegado en Vercel (o similar) y funcionar adecuadamente.
  * La base de datos PostgreSQL debe estar desplegada en Neon (o similar) y conectada a la API de producción.
  * El frontend React debe estar configurado para apuntar a la URL desplegada del backend en producción.
  * La base de datos en Neon debe tener el seed inicial ejecutado.

* **Tareas Técnicas:**
  * Crear un proyecto de base de datos PostgreSQL en Neon.
  * Configurar las variables de entorno de producción en Vercel (incluyendo la `DATABASE_URL` provista por Neon y el `FRONTEND_URL`).
  * Configurar `vercel.json` o la configuración de hosting necesaria para el backend de Express.
  * Desplegar el frontend configurando su variable de entorno de API para apuntar al servidor de producción.

---

### US 11: Sistema de Autenticación de Usuarios (Registro/Login con JWT)
**Como** administrador de la aplicación  
**Quiero** que los usuarios puedan registrarse e iniciar sesión de manera segura  
**Para** proteger las rutas que modifican datos y personalizar la experiencia del usuario.

* **Criterios de Aceptación:**
  * `POST /api/auth/register` debe crear un usuario con `email` y `password` (hasheado con `bcryptjs`) y retornar status `201 Created`.
  * Si el email ya está registrado, debe retornar status `400 Bad Request` y un mensaje de error claro.
  * `POST /api/auth/login` debe validar el email y la contraseña. Si son correctos, retornar status `200 OK` con un token JWT firmado.
  * Si las credenciales son inválidas, retornar status `401 Unauthorized`.
  * Debe implementarse un middleware de autenticación (`requireAuth`) para validar el token JWT enviado en la cabecera `Authorization: Bearer <token>` y añadir el usuario autenticado a `req.user`.

* **Tareas Técnicas:**
  * Crear el modelo `User` en `prisma/schema.prisma` y ejecutar la migración.
  * Instalar las librerías `bcryptjs` y `jsonwebtoken`.
  * Implementar las funciones de validación para registro y login.
  * Crear el controlador y las rutas de autenticación.
  * Crear el middleware `src/middlewares/auth.js` para la protección de rutas.

---

### US 12: Endpoints para Gestión de Favoritos Relacionados con el Usuario
**Como** usuario autenticado  
**Quiero** guardar y eliminar mis cartas favoritas en la base de datos  
**Para** no perder mi colección personal al cambiar de navegador o dispositivo.

* **Criterios de Aceptación:**
  * `GET /api/favorites` debe retornar la lista de cartas favoritas del usuario autenticado con status `200 OK`. Debe soportar internacionalización (estrategia híbrida y aplanada en el objeto raíz).
  * `POST /api/favorites` debe agregar la carta indicada por `cardId` en el body a la lista de favoritos del usuario autenticado, retornando status `201 Created`.
  * Si el `cardId` no existe, retornar status `404 Not Found`.
  * `DELETE /api/favorites/:cardId` debe remover la carta indicada de los favoritos del usuario autenticado con status `200 OK` o `204 No Content`.
  * Todas las rutas de favoritos deben estar protegidas por el middleware de autenticación (`requireAuth`).

* **Tareas Técnicas:**
  * Crear el modelo `Favorite` en `prisma/schema.prisma` vinculando `userId` y `cardId` con clave compuesta única, y ejecutar la migración.
  * Implementar el controlador y las rutas para la gestión de favoritos.
  * Conectar las consultas con Prisma e integrar la función utilitaria de aplanado de i18n en `GET /api/favorites`.

---

### US 13: Configuración e Implementación de Pruebas Unitarias
**Como** desarrollador  
**Quiero** configurar un entorno de pruebas unitarias y escribir tests para controladores y servicios  
**Para** asegurar la calidad del código, evitar regresiones y validar el comportamiento lógico de la API de forma automatizada.

* **Criterios de Aceptación:**
  * Configurar un framework de pruebas moderno (se sugiere Vitest por compatibilidad nativa con ES Modules).
  * Crear un script `pnpm test` que ejecute las pruebas en modo 'watch' y CI.
  * Implementar mocks de Prisma (`PrismaClient`) para que las pruebas unitarias sean independientes de la base de datos física.
  * Escribir pruebas unitarias para `auth.controller.js` (validando registro con contraseñas seguras, logueo con credenciales correctas/incorrectas).
  * Escribir pruebas unitarias para `favorite.controller.js` y `favorite.service.js` (verificando la lógica de agregación, eliminación e idempotencia).

* **Tareas Técnicas:**
  * Instalar `vitest` como devDependency en el proyecto.
  * Configurar los mocks del cliente Prisma en `src/prisma/__mocks__/prismaClient.js` o configurar mocks dinámicos en los archivos de test.
  * Escribir la suite de pruebas unitarias para los servicios y controladores de autenticación y favoritos.
  * Integrar las pruebas en los scripts de ejecución de `package.json`.

---

## Tablero Kanban de Referencia

A modo orientativo, se sugiere organizar el tablero Kanban con los siguientes estados:
1. **Backlog (Pila de Producto):** Todas las Historias de Usuario (US 1 a US 6, US 9, y US 11 a US 13).
2. **To Do (Para Hacer):** Tareas específicas de la US activa desglosadas por el equipo.
3. **In Progress (En Proceso):** Tarea asignada a un desarrollador en ejecución activa.
4. **Testing / Peer Review:** Implementación finalizada que se está validando localmente o revisando mediante Pull Request.
5. **Done (Finalizado):** Historia completada e integrada a la rama principal (`main`/`master`).
