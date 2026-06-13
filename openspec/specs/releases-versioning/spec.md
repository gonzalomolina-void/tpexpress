# Releases and Versioning Specification

## Purpose
Definir los requerimientos y el comportamiento del sistema automático de versionado semántico y publicación de lanzamientos (releases) en el repositorio del proyecto.

## Requirements

### Requirement: Pre-release Quality Gate
El sistema MUST asegurar la calidad del software antes de realizar cualquier lanzamiento, impidiendo la generación de versiones si la suite de pruebas unitarias o de integración están fallando.

#### Scenario: Block Release on Test Failure
- GIVEN que una o más pruebas unitarias o de integración están fallando en el entorno local
- WHEN el mantenedor ejecuta el script de publicación de versión
- THEN el sistema MUST abortar el proceso de release inmediatamente antes de modificar archivos o crear commits
- AND retornar un código de salida de error
- AND no realizar ningún cambio en Git ni en package.json

#### Scenario: Allow Release on All Tests Passing
- GIVEN que el 100% de las pruebas unitarias y de integración pasan de forma exitosa
- WHEN el mantenedor ejecuta el script de publicación de versión
- THEN el sistema MUST proceder al siguiente paso de incremento de versión

---

### Requirement: Version Bump and Changelog Generation
El sistema MUST incrementar automáticamente la versión del software en `package.json` siguiendo el estándar SemVer y generar o actualizar un archivo `CHANGELOG.md` basado en conventional commits.

#### Scenario: Patch Version Bump
- GIVEN un proyecto en la versión `1.0.0`
- WHEN el mantenedor lanza el comando para incrementar una versión tipo `patch` (correcciones de errores)
- THEN el sistema MUST actualizar la versión en `package.json` a `1.0.1`
- AND actualizar `CHANGELOG.md` con los commits tipo `fix` y otros asociados a esta versión
- AND crear un commit de Git y un tag `v1.0.1` de forma local

---

### Requirement: Remote Release Publication
El sistema MUST subir los cambios a remoto y publicar un Release de forma oficial en GitHub utilizando la CLI `gh`.

#### Scenario: Successful GitHub Release Creation
- GIVEN que se ha generado un nuevo tag local `v1.0.1` exitosamente
- WHEN el script empuja los cambios y ejecuta la CLI de GitHub
- THEN el sistema MUST subir los tags al repositorio remoto
- AND publicar un Release en GitHub con el nombre `v1.0.1` y las notas de la versión generadas
