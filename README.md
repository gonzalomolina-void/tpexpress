# Backend: TP REST API y Express

Este repositorio contiene el desarrollo del backend (API REST) para dar soporte a la aplicación web desarrollada en React, reemplazando la persistencia en `localStorage` por una base de datos PostgreSQL persistida de forma real.

## Información del Proyecto

* **Nombre del Proyecto:** `[Nombre de la Aplicación / Proyecto]`
* **Coordinador / PM:** `[Nombre del PM de este TP]`
* **Integrantes del Grupo:**
  * `[Nombre Integrante 1] - [GitHub / Legajo]`
  * `[Nombre Integrante 2] - [GitHub / Legajo]`
  * `[Nombre Integrante 3] - [GitHub / Legajo]`
* **Link al Repositorio Frontend:** `[URL del repositorio de React]`
* **Link al Tablero Kanban:** `[URL de Trello, GitHub Projects, Linear, etc.]`
* **Link al Deploy del Backend:** `[URL pública en Vercel, Render, etc.]`
* **Link al Deploy del Frontend:** `[URL pública del frontend actualizado]`

---

## Descripción General

La aplicación backend está construida sobre **Node.js** utilizando **Express** como framework web, **Prisma ORM** para el mapeo objeto-relacional y **PostgreSQL** como motor de base de datos. 

Su función principal es modelar la entidad principal de la aplicación, proveer un servicio de verificación de salud (health check), implementar un CRUD completo con validaciones manuales estrictas, y gestionar la comunicación mediante CORS con el cliente frontend.

### Entidad Principal: `[Nombre de la Entidad]`
`[Breve descripción de la entidad y su propósito dentro del dominio de la aplicación]`

**Estructura del Modelo:**
* `id`: Identificador único autoincremental.
* `createdAt`: Fecha de creación del registro.
* `updatedAt`: Fecha de última actualización del registro.
* `[Campo 1]`: `[Tipo]` - `[Descripción]`
* `[Campo 2]`: `[Tipo]` - `[Descripción]`
* `[Campo 3]`: `[Tipo]` - `[Descripción]`

---

## Requisitos Previos

Asegúrate de tener instalados los siguientes componentes antes de comenzar:
* **Node.js** (Versión LTS recomendada)
* **pnpm** (Gestor de paquetes rápido de Node)
* **Docker y Docker Compose** (Para levantar la base de datos PostgreSQL local de forma rápida)

---

## Configuración y Ejecución Local

Sigue estos pasos para levantar el entorno de desarrollo local:

### 1. Clonar el Repositorio y Configurar Variables de Entorno
Clona este repositorio en tu máquina local, luego crea una copia del archivo `.env.example` y renombrala a `.env`:
```bash
cp .env.example .env
```
Edita el archivo `.env` configurando los valores de conexión de tu base de datos y puertos.

### 2. Levantar la Base de Datos Local con Docker Compose
Inicia los contenedores de Docker (PostgreSQL y Node) en segundo plano:
```bash
docker-compose up -d
```

### 3. Instalar Dependencias
Instala los paquetes necesarios del proyecto localmente:
```bash
pnpm install
```

### 4. Ejecutar Migraciones de Prisma
Aplica el esquema de base de datos ejecutando las migraciones pendientes:
```bash
npx prisma migrate dev --name init
```

### 5. Semillar la Base de Datos (Seed)
Puebla la base de datos con los registros de prueba requeridos (20 a 30 elementos para verificar scroll y paginados):
```bash
pnpm prisma db seed
```

### 6. Ejecutar el Servidor en Desarrollo
Inicia el servidor Express localmente con recarga automática (`nodemon`):
```bash
pnpm dev
```
La API estará corriendo por defecto en `http://localhost:3000`.

---

## Scripts Disponibles

* `pnpm dev`: Inicia el servidor Express local en modo desarrollo usando nodemon.
* `pnpm start`: Inicia el servidor Express local en modo producción.
* `pnpm prisma migrate dev`: Crea y aplica migraciones en desarrollo.
* `pnpm prisma generate`: Genera el cliente de Prisma.
* `pnpm prisma db seed`: Ejecuta el script de semilla para poblar la base de datos.

---

## Estructura de Directorios del Backend

El proyecto sigue un patrón de separación de responsabilidades:

```text
├── docs/                   # Documentación y pautas del proyecto
├── prisma/                 # Esquemas, semillas y migraciones de Prisma
│   ├── schema.prisma       # Definición del modelo y origen de datos
│   ├── seed.js             # Semillero de base de datos
│   └── migrations/         # Historial de migraciones SQL
├── src/
│   ├── app.js              # Inicialización y configuración de Express
│   ├── index.js            # Punto de entrada de la aplicación
│   ├── routes/             # Definición de rutas y endpoints
│   ├── controllers/        # Controladores que manejan la lógica de petición/respuesta
│   ├── services/           # Capa de servicios para interactuar con la base de datos
│   ├── validations/        # Validaciones manuales escritas en JavaScript
│   ├── middlewares/        # Middlewares (errores globales, CORS, etc.)
│   └── prisma/             # Cliente de Prisma configurado
├── .env.example            # Ejemplo de variables de entorno
├── docker-compose.yml      # Configuración de Docker para Postgres y Node LTS
└── README.md               # Este archivo
```

---

## Endpoints Principales de la API

| Método | Endpoint | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Verifica la salud y estado de la API. | `200` |
| **GET** | `/api/[entidad]` | Obtiene la lista completa de elementos persistidos. | `200`, `500` |
| **GET** | `/api/[entidad]/:id` | Obtiene el detalle de un elemento por su ID. | `200`, `404`, `500` |
| **POST** | `/api/[entidad]` | Crea un nuevo elemento (requiere validación del body). | `201`, `400`, `500` |
| **PUT** | `/api/[entidad]/:id` | Modifica un elemento existente (requiere validación del body). | `200`, `400`, `404`, `500` |
| **DELETE** | `/api/[entidad]/:id` | Elimina un elemento por su ID. | `200`, `204`, `404`, `500` |
