# Design: us-18-versioning-release

## Technical Approach
Implementar un sistema semiautomático de integración continua y publicación de releases a nivel local apoyado en dependencias de Node.js (`standard-version`) y scripts de PowerShell (`scripts/Release-Project.ps1`). El flujo forzará la ejecución exitosa de todas las capas de pruebas antes de modificar la versión o subir tags a GitHub, asegurando la calidad del código publicado.

## Architecture Decisions

### Decision: Uso de standard-version para Versionado
**Choice**: Instalar y configurar `standard-version` como herramienta de automatización para SemVer y changelogs locales.
**Alternatives considered**: Scripts en Node.js personalizados para modificar `package.json` y actualizar `CHANGELOG.md`.
**Rationale**: `standard-version` es un estándar maduro en el ecosistema JS/Node que maneja con precisión los incrementos de versión de `package.json` y genera el `CHANGELOG.md` parseando de forma robusta los commits convencionales de Git, previniendo errores de parsing manuales.

### Decision: Script Coordinador en PowerShell
**Choice**: Crear `scripts/Release-Project.ps1` en PowerShell para coordinar la calidad pre-release y la comunicación con GitHub.
**Alternatives considered**: Scripts en Bash (`.sh`) o scripts en Node.js.
**Rationale**: Dado que el entorno del proyecto corre sobre Windows y ya cuenta con la suite de integración en PowerShell (`Test-Api.ps1`), usar PowerShell permite orquestar de forma nativa e integrada la ejecución de la suite de Vitest, el script de API y las llamadas a la CLI de GitHub (`gh`) de forma robusta, controlando las políticas de ejecución locales.

### Decision: Notas de Releases en GitHub
**Choice**: Utilizar el flag `--generate-notes` de la CLI de GitHub para el cuerpo del Release en la nube.
**Alternatives considered**: Extraer el último bloque de texto del changelog local e inyectarlo en el Release.
**Rationale**: El flag `--generate-notes` es una funcionalidad nativa y oficial de GitHub que agrupa de forma limpia los commits de la versión por categorías, aportando una estética premium en la web, mientras que el repositorio local mantiene de forma inmutable el archivo `CHANGELOG.md` generado por `standard-version`.

## Data Flow
Flujo del proceso de lanzamiento:

    Developer ──(pnpm release:patch)──> scripts/Release-Project.ps1
                                               │
                                       (1. Run Quality Gate)
                                       ├── vitest run (Unit)
                                       └── Test-Api.ps1 (Integration)
                                               │ (If green)
                                       (2. Bump & Changelog)
                                       └── standard-version (Local tag & commit)
                                               │
                                       (3. Git Push tags)
                                       └── git push origin main --follow-tags
                                               │
                                       (4. GitHub Release)
                                       └── gh release create --generate-notes

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Agregar scripts `release:patch`, `release:minor`, `release:major` e instalar `standard-version` como devDependency. |
| `scripts/Release-Project.ps1` | Create | Script de PowerShell para automatizar pre-flight checks, bump, push y creación de releases en GitHub. |
| `README.md` | Modify | Añadir sección documentando el flujo de releases y la integración de tags de producción con Vercel. |

## Interfaces / Contracts

En `package.json` (adición de scripts):
```json
"scripts": {
  "release:patch": "powershell -ExecutionPolicy Bypass -File ./scripts/Release-Project.ps1 -ReleaseType patch",
  "release:minor": "powershell -ExecutionPolicy Bypass -File ./scripts/Release-Project.ps1 -ReleaseType minor",
  "release:major": "powershell -ExecutionPolicy Bypass -File ./scripts/Release-Project.ps1 -ReleaseType major"
}
```

Esquema de ejecución de `scripts/Release-Project.ps1`:
```powershell
param (
    [Parameter(Mandatory=$true)]
    [ValidateSet('patch', 'minor', 'major')]
    [string]$ReleaseType
)
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Integration | Fallo de Tests | Modificar temporalmente un test para que falle y verificar que el script de release aborte sin crear commits ni tags. |
| Integration | Pase Exitoso | Simular un release local con todos los tests pasando y verificar que se genere el tag localmente de forma correcta. |

## Migration / Rollout
No migration required.

## Open Questions
None
