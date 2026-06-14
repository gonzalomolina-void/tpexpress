# Planificación del Proyecto (TP Express & React)

Este documento contiene la planificación del desarrollo del Backend (Node.js, Express, Prisma, PostgreSQL) y la integración del Frontend (React). Los requerimientos han sido desglosados en **Historias de Usuario (User Stories)** con sus respectivos **Criterios de Aceptación** y **Tareas Técnicas**.

---

## Índice de Historias de Usuario

* [US 1: Configuración Inicial del Servidor y Health Check](#us-1-configuración-inicial-del-servidor-y-health-check)
* [US 2: Modelo de Datos, Base de Datos y Migraciones](#us-2-modelo-de-datos-base-de-datos-y-migraciones)
* [US 3: Semillado de la Base de Datos (Seed)](#us-3-semillado-de-la-base-de-datos-seed)
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
* [US 14: Esquema de Roles y Modificación del JWT](#us-14-esquema-de-roles-y-modificación-del-jwt)
* [US 15: Autorización y Control de Acceso por JWT y Roles](#us-15-autorización-y-control-de-acceso-por-jwt-y-roles)
* [US 16: Implementación de Refresh Tokens para Sesiones Persistentes](#us-16-implementación-de-refresh-tokens-para-sesiones-persistentes)
* [US 17: Estandarización de Rutas y Refactorización de Código](#us-17-estandarización-de-rutas-y-refactorización-de-código)
* [US 18: Esquema de Versionado y Lanzamientos en GitHub (GitHub Releases & Version Bump)](#us-18-esquema-de-versionado-y-lanzamientos-en-github-github-releases--version-bump)
* [US 19: Endpoint de Consulta Completa de Carta para Edición (sin aplanar)](#us-19-endpoint-de-consulta-completa-de-carta-para-edición-sin-aplanar)

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

### US 14: Esquema de Roles y Modificación del JWT
**Como** administrador de la aplicación  
**Quiero** incorporar un esquema simple de roles (`admin` y `usuario`) en el modelo de usuario e incluir dicho rol dentro del payload del token JWT  
**Para** permitir que el sistema diferencie los permisos de cada usuario en las solicitudes.

* **Criterios de Aceptación:**
  * El modelo de `User` en la base de datos debe incluir un campo `role` con soporte para dos roles: `usuario` (rol por defecto) y `admin`.
  * El script de semillado (`seed.js`) debe actualizarse para crear al menos un usuario con rol `admin` y otro con rol `usuario`.
  * Al iniciar sesión exitosamente (`POST /api/auth/login`), el token JWT retornado en la respuesta debe contener el rol del usuario en su payload (`role`).
  * Las pruebas unitarias de autenticación (creadas en la US 13) deben actualizarse para verificar que el token generado contenga la propiedad `role` correcta según el usuario logueado.

* **Tareas Técnicas:**
  * Modificar el esquema Prisma (`prisma/schema.prisma`) para agregar el campo `role` al modelo `User` (como un String o Enum, con valor por defecto `'usuario'`).
  * Crear y ejecutar la migración correspondiente para aplicar el cambio en la base de datos.
  * Modificar el script de semilla (`prisma/seed.js`) para incluir roles en los usuarios de prueba.
  * Actualizar el controlador de login (`src/controllers/auth.controller.js`) para incluir el campo `role` del usuario al firmar el JWT.
  * Actualizar la suite de pruebas unitarias de login en `vitest` para comprobar que el JWT retornado incluye la propiedad `role` en su payload.

---

### US 15: Autorización y Control de Acceso por JWT y Roles
**Como** administrador de la aplicación  
**Quiero** proteger los endpoints de la API de acuerdo al rol del usuario autenticado  
**Para** asegurar que solo los usuarios con rol `admin` puedan modificar el catálogo de cartas, mientras que los usuarios con rol `usuario` solo puedan realizar consultas de lectura y gestionar sus propios favoritos.

* **Criterios de Aceptación:**
  * Las peticiones a `POST /api/cards`, `PUT /api/cards/:id` y `DELETE /api/cards/:id` deben requerir un token JWT válido y que el usuario tenga el rol `admin`.
  * Si el usuario está autenticado pero no tiene el rol `admin`, el servidor debe responder con status `403 Forbidden` y un JSON con mensaje de error apropiado.
  * Las peticiones a `GET /api/cards`, `GET /api/cards/:id` y todos los endpoints bajo `/api/favorites` deben estar accesibles para cualquier usuario autenticado (con rol `usuario` o `admin`).
  * Los endpoints protegidos deben seguir ejecutando la validación manual del body (como en la US 5) una vez superada la autenticación y autorización.
  * La documentación interactiva de Swagger UI (`/api/docs`) debe actualizarse para reflejar las restricciones por rol y los códigos de respuesta `403 Forbidden`.
  * La colección de Bruno debe actualizarse para incluir peticiones que prueben la denegación de acceso (error 403) ante un token con rol no autorizado en endpoints administrativos.

* **Tareas Técnicas:**
  * Crear un middleware de autorización por roles (por ejemplo, `requireRole('admin')` o similar) en `src/middlewares/auth.js`.
  * Importar e integrar los middlewares `requireAuth` y el nuevo control de rol en las rutas de escritura de `/api/cards` (`POST`, `PUT`, `DELETE`).
  * Integrar `requireAuth` en las rutas de favoritos `/api/favorites`, permitiendo el acceso tanto a `usuario` como a `admin`.
  * Configurar el esquema de seguridad `bearerAuth` in la configuración general de Swagger (OpenAPI).
  * Decorar/anotar las rutas correspondientes en Swagger para especificar el requerimiento de seguridad y los roles permitidos.
  * Actualizar y organizar la colección de Bruno para verificar las respuestas `401` y `403` según corresponda.

---

### US 16: Implementación de Refresh Tokens para Sesiones Persistentes (Propuesta)
**Como** usuario de la aplicación  
**Quiero** que mi sesión se mantenga activa de forma transparente sin tener que volver a ingresar mis credenciales constantemente  
**Para** interactuar con la aplicación de forma segura y fluida, reduciendo la exposición del access token.

* **Criterios de Aceptación:**
  * El endpoint `POST /api/auth/login` debe retornar un access token (JWT de corta duración, ej: 15 minutos) y un refresh token (de larga duración, ej: 7 días).
  * El refresh token debe almacenarse en la base de datos (relacionado con el usuario) para permitir la revocación manual o por cierre de sesión.
  * El refresh token debe enviarse al cliente preferentemente mediante una cookie segura `httpOnly` (o en su defecto en el body si se decide simplificar en el frontend).
  * Debe existir un endpoint `POST /api/auth/refresh` que reciba el refresh token, verifique su validez (y que no esté revocado en la base de datos), y devuelva un nuevo access token válido.
  * Debe existir un endpoint `POST /api/auth/logout` que invalide el refresh token del usuario en la base de datos.
  * Si el refresh token presentado en `/api/auth/refresh` está expirado o revocado, el servidor debe responder con status `401 Unauthorized`.

* **Tareas Técnicas:**
  * Crear el modelo `RefreshToken` en `schema.prisma` asociado al usuario (con campos para id, token, expiración, si está revocado, etc.) y ejecutar la migración.
  * Modificar `src/controllers/auth.controller.js` para generar tanto el access token como el refresh token al loguearse.
  * Implementar el endpoint y controlador para `POST /api/auth/refresh`.
  * Implementar el endpoint y controlador para `POST /api/auth/logout`.
  * Configurar las cookies seguras en Express para el envío del refresh token si se opta por esta opción.
  * Actualizar la documentación interactiva en Swagger y añadir las peticiones de prueba a la colección de Bruno.

---

### US 17: Estandarización de Rutas y Refactorización de Código
**Como** arquitecto de software  
**Quiero** estandarizar la estructura de las rutas de la API, delegar los manejadores inline a controladores dedicados y centralizar los strings mágicos en constantes  
**Para** mejorar la mantenibilidad, legibilidad y consistencia del código del servidor de cara al crecimiento del proyecto.

* **Criterios de Aceptación:**
  * **Estructura de Rutas Dedicada**: Todas las rutas de la API deben estar declaradas dentro de archivos de rutas dedicados en `src/routes/`. Ninguna ruta debe declararse directamente en `src/app.js` (por ejemplo, mover el healthcheck `/api/health` de `src/app.js` a un archivo de rutas).
  * **Controllers dedicados**: Todos los endpoints declarados en las rutas deben invocar funciones controladoras específicas importadas desde `src/controllers/`. Se prohiben los callbacks inline o funciones anónimas dentro de los archivos de rutas (por ejemplo, extraer la lógica inline de `GET /auth/me` a una función en `auth.controller.js`).
  * **Estandarización de Parámetros de Cartas**: Todas las rutas que referencien a una carta mediante un parámetro en el path de la URL deben unificar dicho parámetro bajo el nombre `:id`. Esto unifica el comportamiento de acceso de los controladores y middlewares (por ejemplo, cambiar la ruta de favoritos `/api/favorites/:cardId` por `/api/favorites/:id`).
  * **Eliminación de Strings Mágicos**: Se deben identificar y refactorizar todos los strings mágicos harcodeados repetitivos en la base del código (como nombres de cookies, expiraciones de tokens, y roles) y centralizarlos en constantes semánticas documentadas.

* **Tareas Técnicas:**
  * Crear un archivo de rutas para utilidades generales o diagnóstico (ej. `src/routes/health.routes.js` o similar) y mover el endpoint `GET /api/health` fuera de `src/app.js`.
  * Extraer el handler de `GET /auth/me` del archivo `auth.routes.js` y definir la función `getMe` en `src/controllers/auth.controller.js`.
  * Modificar la ruta de favoritos en `favorite.routes.js` de `/favorites/:cardId` a `/favorites/:id`. Actualizar el controlador respectivo (`deleteFavorite`) y sus tests unitarios/integración asociados para que lean `req.params.id`.
  * Auditar el código buscando literales recurrentes (ej: `"refreshToken"`, `"15m"`, `"7d"`, `"admin"`, `"usuario"`) y crear un archivo de constantes generales (ej: `src/config/constants.js` o similar) para su centralización.
  * Verificar que todos los tests unitarios e integración sigan pasando al 100% tras la refactorización.

---

### US 18: Esquema de Versionado y Lanzamientos en GitHub (GitHub Releases & Version Bump)
**Como** mantenedor del proyecto  
**Quiero** contar con un proceso automatizado de versionado semántico y publicación de lanzamientos en GitHub  
**Para** registrar de forma histórica las versiones estables del software, documentar de forma clara las novedades y automatizar la preparación del despliegue seguro en producción (Vercel) a partir de releases aprobados.

* **Criterios de Aceptación:**
  * **Versionado Semántico (Bump)**: El proyecto debe contar con un script unificado (`pnpm release` o similar) que aumente automáticamente la versión en `package.json` de acuerdo al estándar SemVer (Semantic Versioning: `PATCH` para fixes, `MINOR` para features, `MAJOR` para breaking changes).
  * **Generación de Changelog**: Se debe generar o actualizar automáticamente un archivo `CHANGELOG.md` en la raíz del proyecto recopilando los cambios ordenados según los conventional commits (e.g. `feat`, `fix`, `docs`, `refactor`) de la nueva versión respecto a la anterior.
  * **Publicación en GitHub (Releases)**: El script o acción de CI/CD debe crear de forma automática un tag en Git con el prefijo `vX.Y.Z`, subir los cambios a remoto y publicar un Release en el repositorio de GitHub con el título de la versión y el Changelog como cuerpo del Release.
  * **Filtro de Calidad Pre-Release**: No debe ser posible publicar un release si las suites de pruebas unitarias o de integración están fallando en el momento del lanzamiento.
  * **Preparación para Despliegue en Vercel**: El tag de versión (`vX.Y.Z`) debe actuar como el trigger de producción oficial en Vercel (o preparar el despliegue mediante una GitHub Action/script de CI que ejecute `vercel deploy --prod`), garantizando que solo versiones etiquetadas y validadas por los tests lleguen al entorno de producción, aislando las ramas de desarrollo.

* **Tareas Técnicas:**
  * Configurar y documentar el uso de una herramienta estándar de versionado y changelogs (e.g. `standard-version` o configurar un script nativo en PowerShell/Node junto a `gh release`).
  * Agregar scripts dedicados en `package.json` (ej: `"release:patch"`, `"release:minor"`, `"release:major"`) que realicen la secuencia:
    1. Ejecutar la suite completa de tests (`vitest run` y `Test-Api.ps1`).
    2. Incrementar la versión en `package.json` y actualizar el `CHANGELOG.md`.
    3. Crear un commit de release convencional y asociar el tag correspondiente (`vX.Y.Z`).
  * Configurar la integración con la CLI de GitHub (`gh`) en el script para publicar el Release en remoto (`gh release create vX.Y.Z --title "Release vX.Y.Z" --notes-file CHANGELOG.md` o extrayendo el último bloque del changelog).
  * Documentar o configurar la integración de Vercel (a través del panel de Vercel Git Integration o mediante GitHub Actions con `vercel-cli`) para que el despliegue a producción (`production`) se dispare exclusivamente ante la creación de tags de versión `v*`.
  * Documentar todo el flujo de release y despliegue a producción en el archivo `README.md`.

---

### US 19: Endpoint de Consulta Completa de Carta para Edición (sin aplanar)
**Como** desarrollador de la API (Backend)  
**Quiero** proveer un endpoint protegido para obtener todos los datos de una carta con sus traducciones completas (`GET /api/cards/:id/edit`),  
**Para** permitir que el cliente de administración cargue el formulario de edición con los valores de todos los idiomas de forma simultánea.

* **Criterios de Aceptación:**
  * **Control de Acceso (Middleware de Admin)**: El endpoint `GET /api/cards/:id/edit` debe estar protegido por autenticación JWT y requerir obligatoriamente que el usuario tenga el rol de `admin`. Peticiones no autenticadas o de usuarios comunes deben retornar `401 Unauthorized` o `403 Forbidden` respectivamente.
  * **Retorno Completo (Diccionario de Traducciones)**: A diferencia de `GET /api/cards/:id` (que aplana y traduce la carta según el idioma del Header), este endpoint debe retornar el modelo de la base de datos con los campos de traducciones estructurados en un objeto indexado por idioma:
    ```json
    {
      "id": 1,
      "cost": 3,
      "atk": 4,
      "def": 5,
      "image": "/cards/SirKaelen.png",
      "typeCode": "creature",
      "rarityCode": "common",
      "translations": {
        "es": { "name": "Sir Kaelen", "description": "Un caballero leal..." },
        "en": { "name": "Sir Kaelen", "description": "A loyal knight..." }
      }
    }
    ```
  * **Manejo de Errores**: Si el ID de la carta no existe en la base de datos de Prisma, el servidor debe retornar `404 Not Found`.

* **Tareas Técnicas:**
  * Implementar el controlador y la ruta para `GET /api/cards/:id/edit`.
  * Integrar los middlewares `requireAuth` y el control de rol `admin` para securizar el endpoint.
  * Consultar Prisma incluyendo la relación `translations`, `type` y `rarity`, y formatear el output en el controlador para devolver el diccionario estructurado.
  * Crear la suite de pruebas unitarias/integración asociadas para el nuevo endpoint.
  * Actualizar la documentación de Swagger y la colección de Bruno.

---

## Tablero Kanban de Referencia

A modo orientativo, se sugiere organizar el tablero Kanban con los siguientes estados:
1. **Backlog (Pila de Producto):** Todas las Historias de Usuario (US 1 a US 6, US 9, y US 11 a US 18).
2. **To Do (Para Hacer):** Tareas específicas de la US activa desglosadas por el equipo.
3. **In Progress (En Proceso):** Tarea asignada a un desarrollador en ejecución activa.
4. **Testing / Peer Review:** Implementación finalizada que se está validando localmente o revisando mediante Pull Request.
5. **Done (Finalizado):** Historia completada e integrada a la rama principal (`main`/`master`).
