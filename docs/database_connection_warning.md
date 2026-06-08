# Advertencia de Deprecación en Conexión a Base de Datos (PostgreSQL / Prisma)

Durante la ejecución de las pruebas de integración en `test-api.ps1`, se detectó una advertencia de obsolescencia (deprecation warning) crítica en la consola al realizar operaciones de escritura en lote (como la creación de cartas en `POST /api/cards`):

```
(node:20992) DeprecationWarning: Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0. Use async/await or an external async flow control mechanism instead.
```

---

## 🔍 Causa Raíz

El proyecto utiliza `@prisma/adapter-pg` para conectar Prisma Client con un pool de conexiones gestionado por la librería `pg` (node-postgres) en JavaScript. 

Cuando Prisma realiza operaciones concurrentes o complejas dentro de una sola transacción (como crear una carta e insertar sus traducciones relacionales simultáneamente):
1. Las consultas se ejecutan sobre una única conexión física asignada a la transacción.
2. `@prisma/adapter-pg` envía múltiples consultas en paralelo a través de esta única conexión.
3. El driver `pg` detecta esta superposición (que viola el protocolo secuencial nativo de PostgreSQL) y emite la advertencia.

> [!WARNING]
> En la futura versión `pg@9.0`, esto dejará de ser una advertencia y pasará a ser un **error crítico** que romperá las operaciones de escritura transaccionales en la API.

---

## 🛡️ Decisión de Diseño (Entrega Inmediata)

> [!IMPORTANT]
> **Prioridad Actual**: Entrega del trabajo práctico.
> **Decisión**: **Postergar la refactorización** de la conexión a la base de datos para evitar introducir riesgos en la capa de persistencia a pocas horas de la entrega. La app funciona correctamente hoy porque es solo una advertencia.

---

## 🚀 Plan de Acción Posterior a la Entrega

Una vez entregado el trabajo, se recomienda implementar la **Opción A (Query Engine Nativo)** para resolver esto de raíz con máxima performance.

### Paso 1: Modificar `prisma/schema.prisma`
Agregar la variable de entorno para la URL de la base de datos de manera directa en el datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Paso 2: Simplificar `src/prisma/prismaClient.js`
Eliminar `@prisma/adapter-pg` y el pool de `pg` en JavaScript, dejando que el Query Engine nativo de Prisma (escrito en Rust) gestione el pool de conexiones eficientemente:

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```

### Paso 3: Limpiar Dependencias
Remover las librerías innecesarias de `package.json`:
```bash
pnpm remove @prisma/adapter-pg pg
pnpm install
npx prisma generate
```
