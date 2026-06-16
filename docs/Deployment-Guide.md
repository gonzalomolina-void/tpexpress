# Guía de Despliegue en Producción — US 9

Esta guía detalla los pasos manuales y configuraciones necesarias para desplegar la base de datos PostgreSQL, el Backend (API Express) y el Frontend (React) en sus respectivos entornos de producción.

---

## Arquitectura de Producción

El ecosistema desplegado se compone de:

```mermaid
graph TD
    A[Cliente / Navegador] -->|HTTPS| B(Frontend: Vercel - React/Vite)
    B -->|Llamadas API| C(Backend: Vercel - Express)
    C -->|Consultas Prisma DSN| D(Database: Neon - Serverless PostgreSQL)
```

| Componente | Plataforma | Env Var Principal | Propósito |
|---|---|---|---|
| **Base de Datos** | Neon.tech | `DATABASE_URL` | Base de datos PostgreSQL serverless. |
| **Backend API** | Vercel | `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` | API REST segura basada en Express y Prisma. |
| **Frontend App** | Vercel | `VITE_API_URL`, `VITE_CARDS_URL`, `VITE_SPLASH_URL` | Aplicación web en React y Vite. |

---

## Paso 1: Configurar la Base de Datos en Neon

Neon provee una base de datos PostgreSQL serverless muy fácil de integrar.

1. **Crear una cuenta y proyecto**:
   * Registrate o inicia sesión en [Neon.tech](https://neon.tech/).
   * Creá un nuevo proyecto. Nombralo `tpexpress` y elegí la versión de PostgreSQL recomendada (15 o 16).
   * Seleccioná la región más cercana (ej: `us-east-2` o `sa-east-1` si está disponible para menor latencia).

2. **Obtener la cadena de conexión (DSN)**:
   * En el panel principal de tu proyecto en Neon, copiá la cadena de conexión. Asegurate de seleccionar la opción de conexión directa o pooling según sea necesario.
   * La cadena tendrá un formato similar a este:
     `postgresql://gonzalomolina:password@ep-cool-snowflake-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`

---

## Paso 2: Ejecutar Migraciones y Semillado (Seed) en Neon

Antes de desplegar el backend, la base de datos debe tener el esquema de Prisma y los datos iniciales creados. Ejecutaremos esto desde tu máquina local apuntando temporalmente a la base de datos de producción.

> [!WARNING]
> No reemplaces directamente el valor de `DATABASE_URL` en tu archivo `.env` local para evitar sobreescribir tu base de datos de desarrollo por accidente durante tus pruebas diarias.

### En Windows (PowerShell)
Abrí una terminal en la raíz de la carpeta `tpexpress` y ejecutá:

```powershell
# 1. Configurar temporalmente la variable de entorno en la sesión de la terminal
$env:DATABASE_URL="TU_CADENA_DE_CONEXION_DE_NEON"

# 2. Correr las migraciones para crear las tablas
pnpm prisma migrate deploy

# 3. Correr el seed para poblar tipos, rarezas, cartas y usuarios de prueba
pnpm prisma db seed
```

### En macOS / Linux (Bash/Zsh)
Abrí una terminal en la raíz de la carpeta `tpexpress` y ejecutá:

```bash
# Ejecutar las migraciones con la variable de entorno inline
DATABASE_URL="TU_CADENA_DE_CONEXION_DE_NEON" pnpm prisma migrate deploy

# Ejecutar el seed con la variable de entorno inline
DATABASE_URL="TU_CADENA_DE_CONEXION_DE_NEON" pnpm prisma db seed
```

---

## Paso 3: Desplegar el Backend en Vercel

Hemos configurado un entrypoint dedicado en `api/index.js` y un archivo `vercel.json` en la raíz de `tpexpress` para que Vercel rutee correctamente las peticiones Express de forma serverless. 

Además, se agregó un archivo `.vercelignore` para evitar subir carpetas innecesarias para producción (como `docs/`, `openspec/`, `tests/`, `bruno/` y scripts locales de automatización).

### 🚀 Mejor Práctica: Desplegar desde un Tag de Versión Limpio
Para garantizar que solo despliegues código estable y libre de experimentos locales inconclusos:

1. **Generar la versión** desde tu rama de desarrollo (ej: `develop` o `main`):
   ```bash
   pnpm release:patch   # (Corre el script Release-Project.ps1, genera el tag v1.0.x y lo sube)
   ```
2. **Hacer checkout del tag** recién creado:
   ```bash
   git checkout v1.0.2  # (Reemplazar por el tag correspondiente)
   ```
3. **Proceder con el despliegue** (pasos a continuación).
4. Al finalizar, volver a tu rama de desarrollo:
   ```bash
   git checkout develop
   ```

### Pasos de Configuración en Vercel:

1. **Instalar Vercel CLI** (si no lo tenés instalado):
   ```bash
   npm install -g vercel  # O usar "npx vercel" en los comandos posteriores
   ```

2. **Iniciar el despliegue**:
   Desde la raíz de la carpeta `tpexpress`, ejecutá:
   ```bash
   npx vercel
   ```
   * Te pedirá iniciar sesión (si es la primera vez).
   * Respondé a las preguntas de configuración del proyecto:
     * *Set up and deploy?* `yes`
     * *Which scope?* Tu scope personal (ej: `gonzalomolina-void`).
     * *Link to existing project?* `no`
     * *What's your project's name?* `tpexpress-backend` (o el de tu preferencia).
     * *In which directory is your code located?* `./` (la raíz actual).
     * *Want to override the settings?* `no` (Vercel detecta automáticamente que es un proyecto Node.js).

3. **Configurar las Variables de Env en Vercel**:
   Ingresá al dashboard de Vercel de tu nuevo proyecto `tpexpress-backend`, andá a **Settings > Environment Variables** y agregá las siguientes tres variables obligatorias:

   * `DATABASE_URL`: La cadena de conexión de Neon.
   * `FRONTEND_URL`: La URL de producción de tu frontend (ej: `https://hexa-tcg.vercel.app` o la que te asigne Vercel al subir el front en el Paso 4).
   * `JWT_SECRET`: Una cadena de caracteres segura y secreta para firmar y validar tokens (puedes generarla con `openssl rand -base64 32`).

4. **Desplegar a Producción**:
   Una vez configuradas las variables de entorno, ejecutá en tu terminal:
   ```bash
   npx vercel --prod
   ```
   Esto compilará el backend, generará el cliente de Prisma automáticamente a través del script `postinstall` de `package.json`, y publicará la API de producción. Al finalizar te dará la URL pública (ej: `https://tpexpress-backend.vercel.app`).

---

## Paso 4: Desplegar el Frontend en Vercel

El frontend React está ubicado en `pwatpo2react2` y ya cuenta con un archivo `vercel.json` para dar soporte a las rutas de React Router.

1. **Configurar el entorno**:
   Asegurate de conocer la URL del backend obtenida en el Paso 3 (ej: `https://tpexpress-backend.vercel.app`).

2. **Iniciar el despliegue del Frontend**:
   Navegá a la raíz de la carpeta `pwatpo2react2` y ejecutá:
   ```bash
   npx vercel
   ```
   * Respondé a las preguntas iniciales para enlazar el proyecto:
     * *Link to existing project?* `no`
     * *Project's name*: `hexa-tcg` (o el de tu preferencia).
     * *In which directory is your code located?* `./`
     * *Want to override the settings?* `no` (Vercel detecta automáticamente que es un proyecto Vite/React).

3. **Configurar las Variables de Entorno del Frontend**:
   Ingresá al dashboard de Vercel de tu nuevo proyecto del frontend, andá a **Settings > Environment Variables** y agregá las siguientes variables de compilación:

   * `VITE_API_URL`: La URL de producción de tu backend concatenada con `/api` (ej: `https://tpexpress-backend.vercel.app/api`).
   * `VITE_CARDS_URL`: `https://res.cloudinary.com/dtqgpdxkp/image/upload/`
   * `VITE_SPLASH_URL`: `https://res.cloudinary.com/dtqgpdxkp/image/upload/`

4. **Desplegar el Frontend a Producción**:
   Una vez configuradas las variables de entorno en Vercel, ejecutá en la terminal de la carpeta `pwatpo2react2`:
   ```bash
   npx vercel --prod
   ```
   Esto generará el build de producción inyectando las variables de entorno y desplegará la app React. Al finalizar, la CLI te dará tu URL definitiva del frontend (ej: `https://hexa-tcg.vercel.app`).

---

## Paso 5: Sincronizar CORS (Paso Final de Seguridad)

> [!IMPORTANT]
> Recordá que en el Paso 3 configuraste `FRONTEND_URL` en el backend con un valor tentativo o aproximado. Si la URL final del frontend que obtuviste en el Paso 4 es distinta, debés ir a la configuración del proyecto del **Backend** en Vercel, actualizar el valor de `FRONTEND_URL` con tu URL exacta de producción del frontend, y realizar un redespliegue (Redeploy) de la última build desde la UI de Vercel para que los cambios de CORS surtan efecto y no te bloquee las peticiones desde el cliente.
