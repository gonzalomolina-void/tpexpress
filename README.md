# Backend: TP REST API y Express

Este repositorio contiene el desarrollo del backend (API REST) para dar soporte a la aplicación web desarrollada en React, reemplazando la persistencia en `localStorage` por una base de datos PostgreSQL persistida de forma real.

## Información del Proyecto

* **Nombre del Proyecto:** `Hexa TCG API`
* **Coordinador / PM:** `Juan Cruz Espinoza`
* **Integrantes del Grupo:**
  * `Juan Cruz Espinoza` - FAI-4767 ([JuanEspinoza8](https://github.com/JuanEspinoza8))
  * `Lautaro Mellado` - FAI-2659 ([LautyM22](https://github.com/LautyM22))
  * `Gonzalo Molina` - 42524 ([gonzalomolina-void](https://github.com/gonzalomolina-void))
* **Link al Repositorio Frontend:** [pwatpo2react2](https://github.com/gonzalomolina-void/pwatpo2react2)
* **Link al Tablero Kanban:** `[Pendiente]`
* **Link al Deploy del Backend:** `[Pendiente]`
* **Link al Deploy del Frontend:** `[Pendiente]`

---

## Descripción General

La aplicación backend está construida sobre **Node.js** utilizando **Express** como framework web, **Prisma ORM** para el mapeo objeto-relacional y **PostgreSQL** como motor de base de datos. 

Su función principal es modelar la entidad principal de la aplicación, proveer un servicio de verificación de salud (health check), implementar un CRUD completo con validaciones manuales estrictas, y gestionar la comunicación mediante CORS con el cliente frontend.

### Entidad Principal: `Card`
El dominio del sistema se modela en torno a las cartas (`Card`) de un juego de TCG (Trading Card Game). Cada carta cuenta con estadísticas de combate, un identificador visual y relaciones paramétricas para estructurar de manera óptima las características del negocio. Adicionalmente, cuenta con un sistema de traducción localizable para soportar múltiples lenguajes (Español e Inglés).

**Estructura del Modelo:**
* `id` (`Int`): Identificador único autoincremental de la carta (Primary Key).
* `cost` (`Int`): Costo de maná o energía requerida para jugar la carta.
* `atk` (`Int`): Puntos de ataque / daño infligido.
* `def` (`Int`): Puntos de defensa / resistencia.
* `image` (`String`): Nombre o ruta del archivo de imagen (mapeado desde `media.image`).
* `typeId` (`Int`): Clave foránea que referencia al tipo de carta (`CardType` - creature, spell, artifact).
* `rarityId` (`Int`): Clave foránea que referencia a la rareza (`Rarity` - poor, common, uncommon, rare, epic, legendary).
* `createdAt` (`DateTime`): Fecha y hora de creación del registro.
* `updatedAt` (`DateTime`): Fecha y hora de la última actualización.

### Entidad de Seguridad: `User` y `Role`
Para la autenticación y el control de acceso basado en roles, el sistema modela los usuarios y una tabla paramétrica de roles.

**Estructura del Modelo `User`:**
* `id` (`Int`): Identificador único autoincremental del usuario (Primary Key).
* `email` (`String`): Correo electrónico único del usuario.
* `password` (`String`): Contraseña del usuario (hasheada de forma segura con `bcryptjs`).
* `roleId` (`Int`): Clave foránea que relaciona al usuario con su rol correspondiente.
* `createdAt` (`DateTime`): Fecha y hora de registro.
* `updatedAt` (`DateTime`): Fecha y hora de la última actualización.

**Estructura del Modelo `Role`:**
* `id` (`Int`): Identificador único autoincremental del rol (Primary Key).
* `name` (`String`): Nombre único identificador del rol (ej: `usuario`, `admin`).

---

## Requisitos Previos

Asegúrate de tener instalados los siguientes componentes antes de comenzar:
* **Node.js** (Versión LTS recomendada)
* **pnpm** (Gestor de paquetes rápido de Node)
* **Docker y Docker Compose** (Para levantar la base de datos PostgreSQL local de forma rápida)

### 🐳 Guía de Instalación de Docker y Docker Compose

Docker es fundamental para ejecutar la base de datos PostgreSQL en un entorno aislado sin tener que instalar servicios pesados localmente. A continuación, encontrás las pautas para cada sistema operativo:

#### 💻 Windows (10 o 11)
Para Windows, la mejor alternativa es utilizar **Docker Desktop** respaldado por **WSL 2 (Windows Subsystem for Linux)** para un rendimiento óptimo.
1. **Habilitar características de virtualización**: Asegurate de tener habilitada la virtualización en la BIOS de tu placa madre.
2. **Instalar WSL 2**: Abre PowerShell como **Administrador** y ejecuta:
   ```powershell
   wsl --install
   ```
   *Nota: Si ya tenés WSL instalado, asegurate de que esté actualizado a la versión 2.*
3. **Reiniciar el sistema**: Es indispensable reiniciar la PC para que Windows aplique los cambios.
4. **Instalar Docker Desktop**:
   - Descarga el instalador oficial desde [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop/).
   - Ejecuta el instalador y asegurate de dejar marcada la opción **"Use WSL 2 instead of Hyper-V"**.
   - Al finalizar, inicia Docker Desktop y acepta los términos. ¡Y listo!

#### 🍏 macOS (Intel o Apple Silicon)
1. **Descargar Docker Desktop**: Ve a [Docker Desktop para Mac](https://www.docker.com/products/docker-desktop/) y descarga la versión adecuada para tu procesador:
   - **Apple Silicon** (M1/M2/M3/etc.)
   - **Intel Chip**
2. **Instalación**: Abre el archivo `.dmg` descargado y arrastra la aplicación Docker a tu carpeta de **Aplicaciones**.
3. **Ejecución**: Abre Docker desde Aplicaciones, dale los permisos necesarios en macOS para configurarse y la ballena ya estará activa en tu barra de tareas.

#### 🐧 Linux (Distribuciones basadas en Debian/Ubuntu)
En Linux se recomienda instalar **Docker Engine** directamente mediante la terminal para evitar sobrecargas:
1. **Actualizar paquetes e instalar dependencias**:
   ```bash
   sudo apt update
   sudo apt install -y ca-certificates curl gnupg lsb-release
   ```
2. **Agregar la clave GPG oficial de Docker**:
   ```bash
   sudo mkdir -p /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   ```
3. **Configurar el repositorio oficial**:
   ```bash
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   ```
4. **Instalar Docker Engine y Docker Compose**:
   ```bash
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   ```
5. **Configurar permisos de usuario (Evitar sudo)**:
   Por defecto, Docker requiere privilegios de superusuario. Para correrlo con tu usuario normal, ejecutas:
   ```bash
   sudo usermod -aG docker $USER
   ```
   *Importante: Cerrá sesión y volvé a entrar (o reiniciá) para que impacten los grupos de seguridad.*

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

### 5. Generar el Cliente de Prisma
Antes de semillar o arrancar la aplicación, debés generar localmente el cliente compilado de Prisma:
```bash
pnpm prisma generate
```
> [!TIP]
> **Si usás Windows con PowerShell** y te da un error de seguridad de políticas (`PSSecurityException`), podés solucionarlo corriendo `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` en tu terminal, o usando directamente el comando `pnpm.cmd prisma generate` y `pnpm.cmd prisma db seed`.

### 6. Semillar la Base de Datos (Seed)
Puebla la base de datos con los registros de prueba requeridos (20 a 30 elementos para verificar scroll y paginados):
```bash
pnpm prisma db seed
```

### 7. Ejecutar el Servidor en Desarrollo
Inicia el servidor Express localmente con recarga automática (`nodemon`):
```bash
pnpm dev
```
La API estará corriendo por defecto en `http://localhost:3000`.

---

## Pruebas de la API (Bruno)

Para testear los endpoints de la API de forma local y colaborativa, implementamos una colección de **[Bruno](https://usebruno.com/)**, una alternativa open-source, offline-first y git-friendly a Postman.

### 1. Instalación de Bruno
Podés descargar e instalar Bruno en tu sistema operativo desde su sitio oficial:
* [Descargar Bruno](https://www.usebruno.com/downloads) (disponible para Windows, macOS y Linux).

### 2. Cómo usar la colección local
1. Inicia la aplicación **Bruno**.
2. Selecciona **"Open Collection"** (Abrir colección) en la pantalla de inicio.
3. Busca y selecciona la carpeta [bruno/](/bruno/) que está en la raíz de este proyecto.
4. En el selector de entornos ubicado arriba a la derecha (donde dice *No Environment*), selecciona **Development**. Esto cargará la variable de entorno `baseUrl` configurada como `http://localhost:3000`.

### 3. Flujo de Autenticación Automático
La colección tiene configurado un script post-response en la petición de **Login** (`POST /api/auth/login`). Al iniciar sesión exitosamente, el token JWT se guarda de manera automática en la variable de entorno de tiempo de ejecución `token`.
Los endpoints que requieren autenticación (como **Get Me**) ya están configurados para usar esta variable `{{token}}` automáticamente en la cabecera de tipo Bearer Token.

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