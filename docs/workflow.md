# Guía de Workflow de Desarrollo - TPExpress

Esta guía establece el flujo de trabajo estándar para desarrollar en el proyecto, tanto de forma individual como colaborando con la IA (Antigravity).

---

## 🚀 1. Inicio de una Sesión de Trabajo

Cada vez que comiences a programar, seguí este orden exacto de pasos para evitar problemas de red, bases de datos huérfanas o contenedores caídos:

1. **Abrir Docker Desktop**: Asegurate de que el motor de Docker esté corriendo en tu máquina.
2. **Abrir VS Code**: Posicionate en la carpeta raíz del proyecto (`tpexpress`).
3. **Levantar los Contenedores**: Abrí la terminal integrada de VS Code y ejecutá:
   ```bash
   docker compose up -d
   ```
   *Esto descarga/inicia la base de datos de PostgreSQL y la aplicación de Express de fondo.*
4. **Verificar que el Servidor esté Vivo**:
   - Podés monitorear los logs del servidor con:
     ```bash
     docker compose logs -f app
     ```
   - O abrir tu navegador/cliente HTTP y pegarle al endpoint de salud:
     [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 🛠️ 2. Flujo de Trabajo según el Tipo de Cambios

Para que el entorno no se rompa, recordá qué tenés que hacer según lo que estés modificando:

### A. Cambios de Código Puro (Archivos `.js` en `src/`)
* **¿Qué pasa?**: El directorio local está montado como un volumen en Docker y el contenedor corre con `nodemon`.
* **¿Qué tenés que hacer?**: **NADA**. Simplemente editá tu código y guardá. Nodemon va a reiniciar el servidor Express adentro del contenedor automáticamente en milisegundos.

### B. Cambios de Estructura de Base de Datos (Archivo `prisma/schema.prisma`)
* **¿Qué pasa?**: Postgres no se entera solo de los cambios y Node.js necesita regenerar el cliente de Prisma para tener los nuevos tipos y métodos.
* **¿Qué tenés que hacer?**: Cada vez que agregues/modifiques modelos en el `.prisma`, ejecutá en tu terminal:
   ```bash
   # 1. Regenerá el cliente de Prisma para Node.js
   docker compose exec app pnpm prisma generate

   # 2. Sincronizá el esquema con la base de datos de Postgres
   docker compose exec app pnpm prisma db push
   ```
   *(Opcional) Si querés resetear la base de datos y volver a cargar las 100 cartas de prueba:*
   ```bash
   docker compose exec app pnpm prisma db seed
   ```

### C. Instalación de Nuevas Dependencias (Librerías NPM)
* **¿Qué pasa?**: Necesitás instalar la librería localmente (para que tu VS Code tenga autocompletado y se guarde en `package.json`) y también dentro del contenedor de Docker (para que el server pueda usarla).
* **¿Qué tenés que hacer?**:
   ```bash
   # 1. Instalar localmente en el host
   pnpm add <nombre-paquete>

   # 2. Instalar en el contenedor de Docker
   docker compose exec app pnpm install
   ```

---

## 🤝 3. Trabajar Colaborativamente con Antigravity

Cuando quieras que yo te ayude a resolver un issue, hacé lo siguiente:

1. **Establecer el Contexto**: Decime exactamente qué issue vas a encarar. Si tenés documentación o un archivo de diseño, mencionalo.
2. **Proceso de Commits**: En este proyecto seguimos la convención de **Conventional Commits** (ej: `feat: add card creation endpoint`, `fix: card validation bug`).
   > ⚠️ **REGLA CRÍTICA**: Nunca agregues atribuciones automáticas de la IA (como "Co-Authored-By") en los mensajes de commit. Los commits deben ser limpios y firmados solo por vos.
