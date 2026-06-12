param (
    [Parameter(Mandatory=$true, HelpMessage="Tipo de incremento de versión SemVer (patch, minor, major).")]
    [ValidateSet('patch', 'minor', 'major')]
    [string]$ReleaseType,

    [Parameter(Mandatory=$false, HelpMessage="Si se activa, solo realiza los pre-flight checks y el bump local (no sube a remoto ni crea release en GitHub).")]
    [switch]$LocalOnly
)

# Salir inmediatamente ante cualquier error en la ejecución del script
$ErrorActionPreference = "Stop"

Write-Host "=== INICIANDO FLUJO DE LANZAMIENTO ($ReleaseType) ===" -ForegroundColor Cyan

# -------------------------------------------------------------
# 1. PRE-FLIGHT QUALITY GATE
# -------------------------------------------------------------
Write-Host "`n[1/5] Ejecutando Pre-flight Checks de calidad..." -ForegroundColor Cyan

# A. Tests Unitarios (Vitest)
Write-Host "Corriendo pruebas unitarias con Vitest..." -ForegroundColor Gray
cmd.exe /c "npx vitest run"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Fallo en las pruebas unitarias. Abortando el lanzamiento."
    exit 1
}

# B. Tests de Integración (PowerShell)
Write-Host "Corriendo pruebas de integración de API..." -ForegroundColor Gray
powershell -ExecutionPolicy Bypass -File .\Test-Api.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Fallo en las pruebas de integración de la API. Abortando el lanzamiento."
    exit 1
}

Write-Host "¡Pre-flight Checks aprobados exitosamente! Todo en verde." -ForegroundColor Green

# -------------------------------------------------------------
# 2. VERSION BUMP Y GENERACIÓN DE CHANGELOG
# -------------------------------------------------------------
Write-Host "`n[2/5] Incrementando versión y actualizando CHANGELOG.md..." -ForegroundColor Cyan
cmd.exe /c "npx standard-version --release-as $ReleaseType"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error durante la ejecución de standard-version. Abortando."
    exit 1
}

# Obtener la versión recién generada leyendo package.json
$packageJson = Get-Content -Raw -Path "package.json" | ConvertFrom-Json
$versionTag = "v" + $packageJson.version
Write-Host "Versión incrementada de forma local a: $versionTag" -ForegroundColor Green

# Si es modo LocalOnly, detenemos el flujo acá de forma limpia
if ($LocalOnly) {
    Write-Host "`n[SWITCH] Modo LocalOnly activo. Saltando el push a remoto y creación de Release en GitHub." -ForegroundColor Yellow
    Write-Host "Flujo completado localmente de forma exitosa." -ForegroundColor Green
    exit 0
}

# -------------------------------------------------------------
# 3. GIT PUSH A REMOTO
# -------------------------------------------------------------
$activeBranch = git branch --show-current
Write-Host "`n[3/5] Subiendo commits y tags a la rama '$activeBranch' en GitHub..." -ForegroundColor Cyan
git push origin $activeBranch --follow-tags
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al empujar los commits y tags a remoto. Abortando."
    exit 1
}
Write-Host "Cambios subidos a remoto con éxito." -ForegroundColor Green

# -------------------------------------------------------------
# 4. PUBLICACIÓN DEL RELEASE EN GITHUB
# -------------------------------------------------------------
Write-Host "`n[4/5] Creando el Release oficial en la web de GitHub..." -ForegroundColor Cyan
cmd.exe /c "gh release create $versionTag --title `"Release $versionTag`" --generate-notes"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al publicar el Release de la versión $versionTag en GitHub."
    exit 1
}
Write-Host "¡Release $versionTag publicado de forma oficial en GitHub!" -ForegroundColor Green

# -------------------------------------------------------------
# 5. RESUMEN FINAL
# -------------------------------------------------------------
Write-Host "`n[5/5] Lanzamiento completado con éxito." -ForegroundColor Green
Write-Host "Versión publicada: $versionTag" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
