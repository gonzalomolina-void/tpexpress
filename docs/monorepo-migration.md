# Propuesta de Migración a Monorepo

Este documento describe la propuesta técnica para unificar los repositorios actuales de backend (`tpexpress`) y frontend (`pwatpo2react2`) en un único **Monorepo** utilizando **pnpm workspaces**, **Turborepo** y **Changesets**.

---

## 1. ¿Cómo encarar la migración? (Repositorios y Git)

### ¿Crear un repositorio nuevo o usar uno existente?
**Recomendación:** Lo más limpio es crear un **repositorio nuevo en blanco** (por ejemplo, `hexa-tcg-monorepo`) y fusionar el código de ambos proyectos dentro. 

Para **no perder el historial de commits** de los desarrolladores en la migración, se puede utilizar la técnica de remotos de Git.

### Paso a paso para migrar sin perder el historial de Git:

1. **Inicializar el nuevo Monorepo:**
   ```bash
   mkdir hexa-tcg-monorepo
   cd hexa-tcg-monorepo
   git init
   # Crear estructura inicial de carpetas
   mkdir apps
   mkdir packages
   ```

2. **Traer el Backend (`tpexpress`) manteniendo su historial:**
   ```bash
   git remote add backend-origin https://github.com/gonzalomolina-void/tpexpress.git
   git fetch backend-origin
   git merge backend-origin/main --allow-unrelated-histories -m "Merge: Importar historial de backend"
   # Mover todos los archivos de backend a la carpeta apps/api/
   mkdir -p apps/api
   # Mover archivos (en PowerShell o Bash) cuidando de no mover la carpeta .git
   # Ejemplo en Bash:
   # rsync -av --exclude='apps' --exclude='packages' --exclude='.git' ./ apps/api/
   # Borrar archivos duplicados de la raíz y hacer commit
   git add .
   git commit -m "refactor: mover backend a apps/api"
   git remote remove backend-origin
   ```

3. **Traer el Frontend (`pwatpo2react2`) manteniendo su historial:**
   ```bash
   git remote add frontend-origin https://github.com/gonzalomolina-void/pwatpo2react2.git
   git fetch frontend-origin
   git merge frontend-origin/main --allow-unrelated-histories -m "Merge: Importar historial de frontend"
   # Mover todos los archivos de frontend a la carpeta apps/frontend/
   mkdir -p apps/frontend
   # Mover archivos y hacer commit
   git add .
   git commit -m "refactor: mover frontend a apps/frontend"
   git remote remove frontend-origin
   ```

---

## 2. Estructura de Directorios Propuesta

```text
hexa-tcg-monorepo/
├── package.json               # Dependencias de desarrollo globales (ESLint, Prettier, Turbo)
├── pnpm-workspace.yaml        # Configuración de espacios de trabajo de pnpm
├── turbo.json                 # Configuración de pipelines de Turborepo
├── .changeset/                # Configuración de Changesets para versionamiento
│   └── config.json
├── apps/
│   ├── api/                   # Backend (TPExpress)
│   │   ├── package.json
│   │   └── src/
│   └── frontend/              # Frontend (React + Vite)
│       ├── package.json
│       └── src/
└── packages/
    └── shared/                # Lógica de negocio/tipos compartidos (Opcional en el futuro)
        ├── package.json
        └── src/
```

---

## 3. Configuración de Herramientas

### A. `pnpm-workspace.yaml` (Raíz)
Define qué directorios contienen paquetes o aplicaciones del workspace:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### B. `turbo.json` (Raíz)
Configura las tareas de compilación, testing y linting para que aprovechen la caché inteligente de Turborepo:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### C. `package.json` (Raíz)
Permite correr comandos globales en todas las aplicaciones de forma paralela:
```json
{
  "name": "hexa-tcg-monorepo",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "changeset": "changeset",
    "release": "changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.1",
    "turbo": "^1.12.4"
  }
}
```

---

## 4. Flujo de Trabajo en el Monorepo

*   **Levantar todo en desarrollo:**
    Ejecutás `pnpm dev` en la raíz. Turborepo levantará el backend (puerto 3000) y el frontend (puerto 5173) en paralelo con una sola consola organizada.
*   **Instalar una librería de desarrollo global:**
    `pnpm add -wD prettier` (el flag `-w` indica que va al Workspace root).
*   **Instalar una dependencia en una aplicación específica:**
    `pnpm --filter api add bcryptjs` o `pnpm --filter frontend add lucide-react`.
*   **Crear un Release Sincronizado:**
    1. Hacés tus cambios en una rama.
    2. Ejecutás `pnpm changeset`.
    3. Elegís qué app cambió y escribís el log.
    4. Al fusionar a `main`, la GitHub Action de Changesets detecta el archivo, sube la versión de ambas aplicaciones a la par (ej. `1.20.0`), crea los tags de Git correspondientes y publica/deploya de forma automática.
