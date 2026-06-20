# Database Branching: Resincronización de Estado (Código vs. Datos)

En flujos de desarrollo ágiles basados en ramas de Git, un problema recurrente es la desincronización entre el estado del código (que cambia instantáneamente al hacer `git checkout`) y el estado de la base de datos local (que persiste de forma monolítica en contenedores como Docker).

Este documento explica el problema clásico de desfase de datos y detalla el concepto de **Database Branching** como la solución moderna para emparejar el estado del código con el de la persistencia.

---

## 1. El Problema: Persistencia Monolítica vs. Git Dinámico

Cuando cambiamos de rama en Git:
1. **El código muta:** El esquema de base de datos (`prisma/schema.prisma`), las migraciones generadas y las consultas en los servicios cambian.
2. **La base de datos no cambia:** El contenedor de Docker (PostgreSQL) conserva las tablas y los registros creados en la rama anterior.

### Consecuencias comunes:
* **Registros huérfanos:** Usuarios creados en ramas que no disparan triggers de relaciones obligatorias (por ejemplo, perfiles anidados).
* **Desfase de secuencias:** IDs autoincrementales (`SERIAL` o `IDENTITY`) que continúan incrementándose indefinidamente, provocando que los IDs de la base de datos difieran de los esperados en pruebas unitarias deterministas.
* **Migraciones corruptas:** Tablas ya creadas físicamente en la DB pero inexistentes en el historial de migraciones de la rama Git actual.

---

## 2. La Solución: Database Branching

El **Database Branching** (Ramificación de Base de Datos) permite crear clones lógicos instantáneos de la base de datos para que cada rama de Git se conecte a su propia copia aislada de los datos.

### ¿Cómo funciona en la nube (ej. Neon)?
Las bases de datos modernas separan el **cómputo** (los nodos de consulta SQL) del **almacenamiento** (el motor que guarda las páginas de datos).

```
Ramas de Git:         [ main ] ──────────────────────→ [ feat/user-profile ]
                                                                 │
                                                       (conecta automáticamente)
                                                                 ▼
Ramas de Base de Datos: [ db-main ] (Puntero LSN) ────────────→ [ db-profile ] (Copy-On-Write)
```

1. **Punteros LSN (Log Sequence Number):** La rama principal almacena un historial de cambios cronológicos. Al crear una rama, Neon crea un puntero virtual al LSN exacto del padre. No duplica físicamente los archivos.
2. **Copy-on-Write (COW):** La base de datos lee los datos históricos del padre. Solo cuando la rama hija realiza una escritura (`INSERT`, `UPDATE`), esa nueva página de datos se escribe de forma aislada para la rama hija.
3. **Velocidad instantánea:** Clonar bases de datos de terabytes toma milisegundos y consume almacenamiento casi nulo al crearse.

---

## 3. Enfoque Extremo: Dolt (SQL con Semántica Git)

Si se requiere esta funcionalidad de manera local sin depender de la nube, existe **[Dolt](https://github.com/dolthub/dolt)**. Es un motor SQL compatible con MySQL escrito en Go que implementa el control de versiones directamente en el almacenamiento de datos.

Con Dolt, podés usar sentencias SQL y comandos de terminal Git integrados:
```bash
# Clonar datos y esquema
dolt clone mi-organizacion/mi-db

# Crear una rama para trabajar una funcionalidad
dolt checkout -b feat/user-profile

# Confirmar cambios en los datos (como agregar una nueva carta o usuario)
dolt commit -a -m "Agregar usuarios iniciales de QA"
```

Dolt permite incluso resolver conflictos de celdas al fusionar datos (`dolt merge`) de dos ramas distintas de forma nativa.

---

## 4. Integración Práctica con Git Hooks

Para evitar la desincronización de forma automática en entornos de desarrollo, se puede implementar un script de **Git Hook** (específicamente un hook `post-checkout`):

```bash
#!/bin/bash
# .git/hooks/post-checkout

# 1. Obtener el nombre de la rama actual de Git
BRANCH_NAME=$(git symbolic-ref --short HEAD)

# 2. Indicar al proveedor (ej. Neon CLI o Dolt) que cree/cambie a la rama de DB correspondiente
neon branches create --name db-$BRANCH_NAME --parent main --existing-action reuse

# 3. Actualizar la variable DATABASE_URL en el archivo .env local
DATABASE_URL="postgresql://user:pass@neon-host/db-$BRANCH_NAME"
sed -i "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env
```

Con esta automatización, cada vez que hacés `git checkout`, tu base de datos cambia de rama en segundo plano, aislando los datos basura y asegurando un entorno determinista.
