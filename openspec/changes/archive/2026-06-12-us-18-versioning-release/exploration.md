## Exploration: us-18-versioning-release

### Current State
El proyecto no cuenta con ninguna automatización para el versionado semántico ni para la publicación de lanzamientos en GitHub. La versión actual en `package.json` es `1.0.0` y no existen scripts de release ni archivo `CHANGELOG.md`. Tampoco existen workflows de GitHub Actions para restringir los despliegues de Vercel ante tags específicos. Se cuenta con un script de tests de integración `Test-Api.ps1` y de tests unitarios `vitest run` que se ejecutan manualmente.

### Affected Areas
- `package.json` — Adición de dependencias de desarrollo y scripts de release (`release:patch`, `release:minor`, `release:major`).
- `CHANGELOG.md` — Creación del archivo de registro histórico de cambios (changelog).
- `New-Release.ps1` o un nuevo script de automatización — Integración de pre-flight checks (correr tests) y publicación en GitHub usando `gh`.
- `README.md` — Documentación del flujo de versionado y releases del proyecto.

### Approaches
1. **Automatización Local con standard-version y script nativo**:
   - Usar `standard-version` para realizar el bump de versión de `package.json`, generación del `CHANGELOG.md` local, y creación del commit + tag de Git.
   - Usar un script en PowerShell (`scripts/Release-Project.ps1` o similar) que:
     1. Corra la suite completa de pruebas unitarias (`pnpm test`) y de integración (`./Test-Api.ps1`). Si alguno falla, abortar inmediatamente.
     2. Dispare `standard-version` según el tipo de bump (`patch`, `minor`, `major`).
     3. Suba los cambios a remoto (`git push --follow-tags`).
     4. Publique el release usando la CLI de GitHub (`gh release create`).
   - Pros: Todo el proceso local se automatiza en un solo comando que valida la calidad pre-release, genera el changelog localmente y publica el release en GitHub de forma oficial.
   - Cons: Requiere instalar `standard-version` como devDependency.
   - Effort: Medium

2. **Script nativo Node.js sin dependencias**:
   - Escribir un script custom en Node.js para leer y modificar `package.json` manualmente, y delegar el changelog exclusivamente a GitHub Releases (`gh release create --generate-notes`).
   - Pros: Cero dependencias adicionales de Node.js.
   - Cons: No se genera un `CHANGELOG.md` local en el repositorio (solo se visualiza en la web de GitHub), y programar la lógica del parser de versionado semántico es reinventar la rueda y propenso a errores.
   - Effort: Medium-High

### Recommendation
Se recomienda el Enfoque 1 porque `standard-version` es el estándar indiscutido en el ecosistema de Node para generar el `CHANGELOG.md` local inmutable en base a commits convencionales y hacer el bump de versión. Esto se complementa perfectamente con un script en PowerShell para pre-flight checks y `gh` para releases en la nube.

### Risks
- Conflictos de autenticación con la CLI de GitHub (`gh`) en el entorno de ejecución, aunque ya comprobamos que funciona correctamente en esta máquina.
- Que el usuario intente hacer un release teniendo pruebas fallando. Se mitiga forzando que el script falle inmediatamente ante cualquier fallo de test.

### Ready for Proposal
Yes
