# Trabajo Práctico Obligatorio: Seguridad, Autenticación y JWT
**Universidad Nacional del Comahue**  
**Facultad de Informática**  
**Programación Web Avanzada (2026)**

---

## 🎯 Objetivo del Trabajo Práctico
El objetivo es incorporar un sistema de autenticación y autorización mediante **JSON Web Tokens (JWT)** sobre el servidor API REST desarrollado en el trabajo práctico anterior y la aplicación React del TP 2.

La aplicación deberá permitir que distintos usuarios puedan registrarse, iniciar sesión, y administrar sus favoritos (asociados de forma persistente a su usuario en la base de datos). De esta manera, cada usuario conservará sus propios favoritos sin importar si cierra sesión, vuelve a iniciar o ingresa desde otro dispositivo.

---

## 📋 Requerimientos Generales

El trabajo práctico deberá incorporar de forma obligatoria:
* **Persistencia de Usuarios**: Creación de la entidad `User` en Prisma con contraseñas hasheadas.
* **Autenticación**: Login y registro de usuarios, además de endpoint para obtener los datos de la sesión actual (`/auth/me`).
* **Seguridad**: Autenticación mediante JWT, firma segura con variable de entorno, y middleware de autenticación en rutas privadas del servidor.
* **Gestión de Favoritos**: Endpoints protegidos para listar, agregar y quitar favoritos por usuario autenticado.
* **Integración Frontend**: Formularios de Registro y Login en React, flujo de Logout y visualización de favoritos consumidos desde el backend.
* **Validaciones y Errores**: Control de datos de entrada en todos los endpoints y respuestas con códigos de estado HTTP apropiados.
* **Documentación**: README actualizado tanto en el servidor como en el frontend.

---

## 🗄️ Modelo de Datos

Se deberá agregar una entidad **`User`** al esquema de Prisma con los siguientes campos como mínimo:
* `id`
* `name` (o nombre)
* `email` (único)
* `password` (almacenada con hash)
* `createdAt`
* `updatedAt`

### Relación de Favoritos
Se debe definir una relación entre `User` y la entidad principal del proyecto (por ejemplo, `Card` en este caso) mediante una entidad intermedia de favoritos (ej: `Favorite`).
* Cada favorito debe pertenecer a un usuario y hacer referencia a un elemento existente del dominio.
* **Restricción**: No se debe permitir que un mismo usuario agregue el mismo elemento más de una vez a sus favoritos (clave primaria compuesta o índice único en `[userId, elementId]`).

---

## 🔌 Endpoints Obligatorios del Backend

### Autenticación

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| **POST** | `/auth/register` | Registrar un nuevo usuario |
| **POST** | `/auth/login` | Iniciar sesión y obtener token JWT |
| **POST** | `/auth/logout` | Cerrar sesión (invalidar tokens) |
| **GET** | `/auth/me` | Obtener datos del usuario autenticado actual |

### Favoritos

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| **GET** | `/favorites` | Listar los favoritos del usuario autenticado (con detalles del elemento) |
| **POST** | `/favorites/:id` | Agregar un elemento a favoritos |
| **DELETE** | `/favorites/:id` | Quitar un elemento de favoritos |

> [!IMPORTANT]
> En los endpoints de favoritos, **el usuario no debe enviarse por el body ni por parámetros de URL**. Debe ser extraído directamente por el servidor a partir del token JWT adjuntado en los headers de la request (`Authorization: Bearer <token>`).

---

## ⚙️ Comportamiento de los Endpoints (Backend)

### 1. Registro de Usuarios (`POST /auth/register`)
* **Acciones**:
  * Validar datos de entrada obligatorios.
  * Verificar que el `email` no esté registrado.
  * Hashear la contraseña antes de guardarla.
  * Crear el usuario en la base de datos.
  * Ocultar la contraseña hasheada del objeto devuelto en la respuesta.
* **Códigos HTTP Esperados**:
  * `201 Created` para un registro exitoso.
  * `400 Bad Request` si faltan campos requeridos o el formato es inválido.
  * `409 Conflict` si el email ya existe en la base de datos.

### 2. Login de Usuarios (`POST /auth/login`)
* **Acciones**:
  * Validar email y contraseña en la request.
  * Buscar al usuario por email en la base de datos.
  * Comparar la contraseña ingresada con el hash guardado (ej. usando `bcrypt`).
  * Generar un token JWT firmado si las credenciales son válidas.
  * Retornar el token junto con los datos básicos del usuario (sin contraseña).
* **Códigos HTTP Esperados**:
  * `200 OK` si el login es exitoso.
  * `400 Bad Request` si faltan datos en la petición.
  * `401 Unauthorized` si las credenciales son incorrectas.

### 3. Logout (`POST /auth/logout`)
* Para una implementación JWT sin estado (stateless): el endpoint puede simplemente responder con `200 OK` y delegar al frontend la destrucción local del token.
* Si se implementa la persistencia de refresh tokens, el endpoint deberá invalidar, revocar o eliminar el token correspondiente de la base de datos.

### 4. Agregar a Favoritos (`POST /favorites/:id`)
* **Acciones**:
  * Requerir autenticación (middleware JWT).
  * Validar que el elemento de dominio (ej. carta) con el ID provisto exista.
  * Validar que el elemento no esté en los favoritos del usuario actual.
  * Crear la relación entre el usuario y el favorito.
* **Códigos HTTP Esperados**:
  * `201 Created` si se añade correctamente.
  * `401 Unauthorized` si no se envía el header de autorización.
  * `403 Forbidden` si el token JWT es inválido o expiró.
  * `404 Not Found` si el elemento a agregar no existe.
  * `409 Conflict` si ya estaba marcado como favorito.

### 5. Quitar de Favoritos (`DELETE /favorites/:id`)
* **Acciones**:
  * Requerir autenticación.
  * Validar que el favorito exista para el usuario logueado.
  * Eliminar la relación de favoritos.
* **Códigos HTTP Esperados**:
  * `200 OK` si se elimina con éxito.
  * `401 Unauthorized` si no se envía token.
  * `403 Forbidden` si el token es inválido.
  * `404 Not Found` si no existe tal favorito para el usuario.

### 6. Listar Favoritos (`GET /favorites`)
* **Acciones**:
  * Requerir autenticación.
  * Retornar únicamente los favoritos correspondientes al usuario autenticado.
  * **Importante**: La respuesta debe incluir la información detallada del objeto favorito (nombre, imágenes, stats, etc.), y no solamente su `id`.

---

## 💻 Requerimientos del Frontend (React)

Se deberá integrar la aplicación React del TP 2 agregando:
* **Pantallas/Componentes**:
  * **Registro**: Formulario con nombre, email, contraseña, validación básica, mensajes de error y redirección/inicio de sesión automático ante éxito.
  * **Login**: Formulario de ingreso de credenciales. Debe guardar el JWT recibido y mantener la sesión del usuario.
  * **Logout**: Limpiar el token de la aplicación, llamar al endpoint de logout y reestructurar la UI.
* **Gestión de Sesión**:
  * Mantener disponible el estado global del usuario logueado.
  * El JWT se puede almacenar en `localStorage` o a través de `Cookies`.
  * Enviar el token en las solicitudes protegidas usando el header estándar `Authorization: Bearer <token>`.
* **Interacciones de Favoritos**:
  * Los favoritos **no se guardan en localStorage**. Se debe Sincronizar su estado con la base de datos a través de la API.
  * Si el usuario no está autenticado, no debe permitirse agregar o quitar favoritos.
  * Visualización y control interactivo de favoritos en la UI de forma clara.

---

## 🛡️ Seguridad Mínima Requerida

* **Sin contraseñas en texto plano**: Las contraseñas se deben cifrar usando hashes (como `bcryptjs`).
* **Privacidad de contraseñas**: Ningún endpoint debe devolver el campo `password` en el cuerpo de la respuesta.
* **Firma del JWT**: El token debe firmarse con una clave secreta guardada exclusivamente en variables de entorno (`.env`), nunca harcodeada.
* **Protección de Rutas**: Utilizar middlewares de Express para proteger las rutas privadas del backend.
* **Identidad basada en el token**: Siempre obtener los identificadores del usuario logueado a través del payload decodificado del JWT. No confiar en `userId` enviados por body/params del cliente.

---

## 📅 Entrega y Evaluación

* **Modalidad**: Continuar trabajando sobre los mismos repositorios provistos al inicio. Crear Pull Requests y commits correspondientes sobre el mismo repositorio.
* **Fecha límite de commit**: Lunes 29/06/2026 a las 23:59 hs.
* **Criterios de Evaluación**:
  * Implementación correcta del flujo de autenticación (Registro, Login, Logout).
  * Uso correcto y seguro de JWT en headers.
  * Middleware de autenticación y protección de rutas privadas.
  * Correcta estructura de datos y relación de usuarios con favoritos.
  * Hash de contraseñas y sanitización de datos (sin passwords expuestas).
  * Manejo e integración de la sesión y favoritos en el frontend.
  * Documentación en los README de frontend y backend.
  * Control de errores e idoneidad de respuestas HTTP.

---

## ⭐ Bonus Opcional: Refresh Token
Como funcionalidad adicional (opcional), se permite incorporar mecanismos de **Refresh Token**.
* El login deberá devolver tanto un `accessToken` (de corta duración) como un `refreshToken` (de larga duración).
* El frontend podrá solicitar un nuevo `accessToken` usando el refresh token sin obligar al usuario a iniciar sesión nuevamente.
* Requisitos del Refresh Token:
  * Persistencia en base de datos de los tokens válidos/revocados con fecha de vencimiento.
  * Endpoint adicional:
    | Método | Endpoint | Descripción |
    | :--- | :--- | :--- |
    | **POST** | `/auth/refresh` | Generar un nuevo access token usando un refresh token válido |
  * Invalidar o eliminar el refresh token al efectuar el Logout.
  * Integrar esta lógica en el flujo de peticiones del frontend.
