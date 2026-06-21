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

### 🔄 Resetear la Base de Datos (Reiniciar IDs desde 1)
Si por algún motivo necesitás limpiar la base de datos por completo y que todos los identificadores autoincrementales (IDs) comiencen de nuevo desde `1`, ejecutá:
```bash
pnpm prisma migrate reset
```
*(O `npx prisma migrate reset` si no usás pnpm)*

> [!WARNING]
> Este comando es destructivo en desarrollo. Realiza los siguientes pasos de forma automática:
> 1. **Descarta (Drop)** la base de datos o limpia todas las tablas y esquemas existentes.
> 2. **Aplica** todas las migraciones desde cero (lo que reinicia las secuencias de IDs autoincrementales a 1).
> 3. **Ejecuta** el script de semillado (`prisma/seed.js`) de forma automática al finalizar el reset para dejar la base con datos iniciales limpios.

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

---

## Versionado y Publicación de Releases

El proyecto cuenta con un sistema automatizado para el versionado semántico y la publicación de releases oficiales en GitHub. El flujo garantiza que solo código que pase de forma exitosa las pruebas de calidad pueda publicarse y desplegarse en producción.

### Prerrequisitos
Para realizar una publicación de release a remoto, el mantenedor debe tener:
1. La CLI de GitHub (`gh`) instalada y autenticada en su máquina (`gh auth login`).
2. Permisos de escritura (push) en el repositorio remoto.

### Scripts de Lanzamiento
Se pueden ejecutar los siguientes comandos en la terminal desde la raíz del proyecto:

```bash
# Publicar una versión tipo PATCH (e.g. 1.0.0 -> 1.0.1) para corrección de bugs
pnpm release:patch

# Publicar una versión tipo MINOR (e.g. 1.0.0 -> 1.1.0) para nuevas funcionalidades
pnpm release:minor

# Publicar una versión tipo MAJOR (e.g. 1.0.0 -> 2.0.0) para breaking changes
pnpm release:major
```

### Flujo de Ejecución (Bajo el capó)
Cuando ejecutas cualquiera de los comandos anteriores, el script `scripts/Release-Project.ps1` realiza la siguiente secuencia de forma automática:
1. **Pre-flight Checks (Filtro de Calidad)**: Ejecuta las pruebas unitarias locales (`vitest`) y la suite completa de integración de la API (`Test-Api.ps1`). Si falla una sola prueba, el proceso se aborta inmediatamente y no se genera ningún tag ni commit.
2. **Version Bump & Changelog**: Lanza `standard-version` para incrementar la versión en `package.json` según el tipo seleccionado, actualizar localmente el archivo `CHANGELOG.md` recopilando los cambios de los *conventional commits*, y clavar el tag de Git correspondiente de forma local.
3. **Git Push**: Sube los commits y tags generados a la rama remota (`git push origin <rama> --follow-tags`).
4. **GitHub Release**: Invoca a la CLI de GitHub para publicar el Release oficial en la web de GitHub (`gh release create`) bajo el tag correspondiente y generando automáticamente las notas de lanzamiento en base a los commits.

### Flujo de Integración y Lanzamiento Local (Recomendado)
Para evitar despliegues automáticos duplicados en producción antes de actualizar la versión en `package.json` y el changelog, se recomienda realizar el merge de la rama `develop` a `main` de manera local en tu máquina antes de ejecutar el script de release:

1. **Actualizar ramas locales:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout main
   git pull origin main
   ```

2. **Merge local (sin empujar a remoto):**
   Mergea la rama `develop` en `main` localmente usando `--no-ff` para mantener el registro del merge commit:
   ```bash
   git merge develop --no-ff -m "merge: integrate develop branch into main"
   ```

3. **Lanzar la versión:**
   Ejecuta el script de release correspondiente en la rama `main` local:
   ```bash
   pnpm release:minor
   ```
   *Esto generará el commit de release con la versión actualizada (ej: `1.4.0`) y el tag correspondiente en tu local, y empujará todo junto (`git push origin main --follow-tags`) en un único comando. Así, producción se construirá una sola vez con el versionado correcto.*

### Integración con Vercel
Para asegurar que las ramas de desarrollo permanezcan aisladas y no se desplieguen directamente a producción en Vercel, se recomienda configurar la **Integración de Vercel Git**:
1. En el panel de Vercel, ir a la configuración del proyecto y definir que el entorno de producción (`Production Branch`) se despliegue únicamente cuando ocurran tags de versión coincidiendo con el patrón `v*` (o mediante un script de build step en Vercel que ignore compilaciones si el trigger no es un Git Tag `v*`).
2. Esto asegura que solo las versiones probadas y etiquetadas oficialmente por el script de lanzamiento lleguen al servidor de producción.