# Proposal: us-18-versioning-release

## Executive Summary
Esta propuesta define la implementación del sistema de versionado semántico automático y publicación de Releases en GitHub para el proyecto `tpexpress`. Se introducirá una secuencia de pre-flight checks de calidad, generación del changelog inmutable y publicación de releases a través de la CLI de GitHub.

## Technical Approach
1. **Instalación de Dependencias**: Instalar `standard-version` como devDependency para automatizar el versionado semántico y la actualización de `CHANGELOG.md` basado en conventional commits.
2. **Scripts de Lanzamiento**: Agregar scripts dedicados en `package.json` para facilitar la ejecución del flujo:
   - `"release:patch"`: Ejecutar pre-flight checks y lanzar patch bump.
   - `"release:minor"`: Ejecutar pre-flight checks y lanzar minor bump.
   - `"release:major"`: Ejecutar pre-flight checks y lanzar major bump.
3. **Flujo de Automatización (Pre-flight & Release)**:
   Crear un script en PowerShell (`scripts/Release-Project.ps1`) que realice la siguiente secuencia:
   1. Validar que la rama actual sea `main` o `feat/us-18-versioning-release` (durante pruebas).
   2. Ejecutar tests unitarios (`pnpm test`) y tests de integración (`./Test-Api.ps1`). Si alguno falla, abortar inmediatamente.
   3. Ejecutar `standard-version --release-as <patch/minor/major>`.
   4. Subir los commits y tags a GitHub (`git push --follow-tags`).
   5. Publicar el Release en GitHub leyendo el último bloque del `CHANGELOG.md` o usando `gh release create vX.Y.Z --notes-file CHANGELOG.md` o con generación de notas automáticas.
4. **Documentación del Flujo**: Añadir una sección de "Versionado y Publicación" en el `README.md` detallando las instrucciones para los mantenedores y la configuración del deploy en producción.

## Affected Modules
- `package.json`
- `README.md`
- `scripts/Release-Project.ps1` (Nuevo)

## Rollback Plan
Si un release se publica por error o falla a la mitad:
1. Eliminar el tag de Git local y remotamente (`git tag -d vX.Y.Z` y `git push --delete origin vX.Y.Z`).
2. Eliminar el Release creado en GitHub a través del panel web o usando `gh release delete vX.Y.Z --yes`.
3. Revertir el commit de versionado semántico (`git reset --hard HEAD~1`) y restaurar `package.json` a la versión anterior.
