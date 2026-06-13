# Tasks: us-18-versioning-release

## Phase 1: Foundation / Infrastructure
- [x] 1.1 Instalar la dependencia de desarrollo `standard-version` ejecutando `pnpm add -D standard-version`.
- [x] 1.2 Agregar los scripts de lanzamiento (`release:patch`, `release:minor`, `release:major`) en la sección `scripts` de `package.json`.

## Phase 2: Core Implementation
- [x] 2.1 Crear el archivo de script `scripts/Release-Project.ps1` con validación de parámetros (`patch`, `minor`, `major`).
- [x] 2.2 Implementar en `scripts/Release-Project.ps1` los pre-flight checks de calidad ejecutando `cmd.exe /c "npx vitest run"` y `powershell -ExecutionPolicy Bypass -File .\Test-Api.ps1`. Abortar inmediatamente si alguno retorna error.
- [x] 2.3 Implementar en `scripts/Release-Project.ps1` el versionado local invocando a `npx standard-version --release-as $ReleaseType`.
- [x] 2.4 Implementar en `scripts/Release-Project.ps1` el comando de Git para empujar commits y tags a la rama activa (`git push origin <rama> --follow-tags`).
- [x] 2.5 Implementar en `scripts/Release-Project.ps1` la publicación en GitHub usando la CLI `gh release create <version> --title "Release <version>" --generate-notes`.

## Phase 3: Integration / Wiring
- [x] 3.1 Probar la invocación de los scripts definidos en `package.json` para validar que se ejecute el orquestador de PowerShell correctamente.

## Phase 4: Testing / Verification
- [x] 4.1 Modificar temporalmente un test unitario para que falle y verificar que la ejecución de `pnpm release:patch` aborte la publicación antes de crear commits o tags en Git.
- [x] 4.2 Ejecutar un ciclo completo de lanzamiento local (usando un flag `-LocalOnly` o simulando llamadas) para verificar que `CHANGELOG.md` se cree, `package.json` aumente de versión y el tag Git local se registre de forma consistente.

## Phase 5: Cleanup / Documentation
- [x] 5.1 Documentar las instrucciones de lanzamiento en el archivo `README.md` detallando comandos, prerrequisitos, y la configuración de disparadores de producción en Vercel ante tags `v*`.
