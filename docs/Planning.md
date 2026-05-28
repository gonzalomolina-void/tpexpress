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
* [US 7: Integración Básica del Frontend (Lectura y Estados de UI)](#us-7-integración-básica-del-frontend-lectura-y-estados-de-ui)
* [US 8: Integración Avanzada del Frontend / Postman (Modificaciones del CRUD)](#us-8-integración-avanzada-del-frontend--postman-modificaciones-del-crud)
* [US 9: Despliegue en Producción (Backend, Base de Datos y Frontend)](#us-9-despliegue-en-producción-backend-base-de-datos-y-frontend)
* [US 10 (Bonus): Documentación Interactiva con Swagger](#us-10-bonus-documentación-interactiva-con-swagger)

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
**Quiero** obtener todos los registros o uno específico a partir de su ID desde la base de datos  
**Para** poder visualizarlos en la interfaz del cliente.

* **Criterios de Aceptación:**
  * `GET /api/entidad` debe retornar todos los registros de la entidad con status `200 OK`.
  * `GET /api/entidad/:id` debe retornar el registro correspondiente al ID indicado con status `200 OK`.
  * Si el recurso consultado por ID no existe, se debe responder con status `404 Not Found` y el JSON:
    ```json
    {
      "error": "Recurso no encontrado"
    }
    ```
  * Toda la información debe obtenerse de la base de datos a través de Prisma (no en arrays en memoria ni archivos JSON).

* **Tareas Técnicas:**
  * Crear las rutas y controladores para las peticiones de lectura (`getAll` y `getById`).
  * Implementar los servicios que se comunican con Prisma para consultar la base de datos.
  * Configurar un middleware de manejo de errores global (`src/middlewares/errorHandler.js`) para capturar fallos inesperados y retornar status `500`.

---

### US 5: Endpoints de Escritura de la API con Validación Manual (POST, PUT, DELETE)
**Como** consumidor de la API  
**Quiero** poder crear, modificar y eliminar registros en la base de datos validando los datos de entrada  
**Para** garantizar la integridad del sistema sin depender de librerías externas de validación.

* **Criterios de Aceptación:**
  * `POST /api/entidad` debe crear un registro y responder con status `201 Created`.
  * `PUT /api/entidad/:id` debe actualizar un registro existente y responder con status `200 OK`.
  * `DELETE /api/entidad/:id` debe eliminar el registro y responder con status `200 OK` o `204 No Content`.
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

* **Tareas Técnicas:**
  * Implementar las funciones de validación manual en `src/validations/entity.validation.js`.
  * Crear controladores para `create`, `update` y `delete`.
  * Agregar la validación antes de llamar al servicio de creación/edición.
  * Conectar con Prisma para ejecutar operaciones de persistencia e implementar lógica de manejo del error `404` si el ID a modificar o eliminar no existe en la base de datos.

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

---

### US 7: Integración Básica del Frontend (Lectura y Estados de UI)
**Como** usuario de la aplicación React  
**Quiero** visualizar la información provista por la API y conocer el estado de la comunicación con el servidor (carga o error)  
**Para** tener una experiencia de usuario fluida y transparente sin datos mockeados en `localStorage`.

* **Criterios de Aceptación:**
  * Se debe eliminar el uso de `localStorage` para la persistencia del estado en el frontend.
  * Al ingresar, el frontend debe consultar a la API para traer los elementos y mostrarlos.
  * Mientras se obtienen los datos, debe mostrarse un estado de carga claro (spinner, skeleton o texto).
  * Si la conexión con la API falla o devuelve un error, se debe mostrar un mensaje de error descriptivo en pantalla.
  * Si la base de datos está vacía, se debe mostrar un mensaje que indique que no hay elementos cargados.

* **Tareas Técnicas:**
  * Reemplazar las lecturas directas a `localStorage` por llamadas HTTP (usando `fetch` o `axios`).
  * Agregar estados de React (`isLoading`, `error`) para controlar el renderizado condicional del spinner y mensajes de error.
  * Adaptar el flujo de búsquedas y filtrados para que, si corresponde, consulte al backend.

---

### US 8: Integración Avanzada del Frontend / Postman (Modificaciones del CRUD)
**Como** usuario o administrador  
**Quiero** poder realizar modificaciones (crear, editar, borrar) desde la UI del Frontend (o mediante Postman/Swagger si la UI no lo soporta)  
**Para** gestionar los datos persistidos en tiempo real.

* **Criterios de Aceptación:**
  * Al realizar una acción de creación, edición o eliminación de forma exitosa, la interfaz gráfica debe actualizarse para reflejar los cambios (sin recargar toda la página).
  * Si la operación de escritura falla, la interfaz debe mostrar un mensaje advirtiendo al usuario de manera clara.
  * Las acciones no soportadas por la UI de React deberán poder realizarse y probarse exitosamente usando herramientas como Postman o Swagger.

* **Tareas Técnicas:**
  * Conectar los formularios de creación y edición del frontend a los endpoints correspondientes de la API backend.
  * Implementar el manejo del botón "Eliminar" conectándolo con la API.
  * Manejar los casos de error del backend (como el error `400` de validación) y renderizarlos en los formularios.

---

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

### US 10 (Bonus): Documentación Interactiva con Swagger
**Como** desarrollador integrador  
**Quiero** contar con documentación interactiva de la API  
**Para** conocer y probar rápidamente los endpoints, sus cuerpos de datos requeridos y los códigos de respuesta esperados.

* **Criterios de Aceptación:**
  * Debe existir un endpoint (ej. `/api/docs`) que cargue la interfaz de Swagger UI.
  * La documentación debe listar todos los endpoints del CRUD con descripciones, parámetros esperados, cuerpos JSON de ejemplo y posibles códigos de respuesta (`200`, `201`, `400`, `404`, `500`).

* **Tareas Técnicas:**
  * Instalar `swagger-ui-express` y `swagger-jsdoc` (o preparar un archivo `swagger.json` estático).
  * Configurar e inicializar Swagger en `src/app.js`.
  * Escribir la especificación OpenAPI de los endpoints (ya sea con anotaciones JSDoc en las rutas o en un archivo centralizado).

---

## Tablero Kanban de Referencia

A modo orientativo, se sugiere organizar el tablero Kanban con los siguientes estados:
1. **Backlog (Pila de Producto):** Todas las Historias de Usuario (US 1 a US 10).
2. **To Do (Para Hacer):** Tareas específicas de la US activa desglosadas por el equipo.
3. **In Progress (En Proceso):** Tarea asignada a un desarrollador en ejecución activa.
4. **Testing / Peer Review:** Implementación finalizada que se está validando localmente o revisando mediante Pull Request.
5. **Done (Finalizado):** Historia completada e integrada a la rama principal (`main`/`master`).
