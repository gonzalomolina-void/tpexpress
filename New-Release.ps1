param (
    [Parameter(Mandatory=$true, HelpMessage="Ruta del repositorio de destino oficial donde copiar los cambios.")]
    [string]$DestinationPath,

    [Parameter(Mandatory=$false, HelpMessage="Rama base para calcular la diferencia de cambios.")]
    [string]$BaseBranch = "main"
)

# Validar que el path de destino exista, de lo contrario crearlo
if (!(Test-Path -Path $DestinationPath)) {
    Write-Host "Creando el directorio de destino: $DestinationPath" -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $DestinationPath -Force | Out-Null
}

Write-Host "Calculando cambios respecto a la rama base '$BaseBranch'..." -ForegroundColor Cyan

# Forzamos la evaluación como array @(...) para evitar problemas si git diff retorna un solo archivo
$archivos = @(git diff --diff-filter=d --name-only --merge-base $BaseBranch)

# Si el comando de git falla o no devuelve nada
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al ejecutar 'git diff'. Asegurate de que la rama '$BaseBranch' exista y sea válida."
    exit $LASTEXITCODE
}

if ($archivos.Count -eq 0 -or ($archivos.Count -eq 1 -and [string]::IsNullOrEmpty($archivos[0]))) {
    Write-Host "No se encontraron archivos modificados en la rama actual respecto a '$BaseBranch'." -ForegroundColor Yellow
    exit 0
}

Write-Host "Se encontraron $($archivos.Count) archivos modificados para copiar." -ForegroundColor Green

$copiados = 0
foreach ($archivo in $archivos) {
    if ([string]::IsNullOrWhiteSpace($archivo)) { continue }
    
    if (Test-Path $archivo) {
        # Construir ruta de destino manteniendo la estructura relativa
        $destinoCompleto = Join-Path $DestinationPath $archivo
        $directorioDestino = Split-Path $destinoCompleto -Parent

        # Crear subdirectorios si no existen en el destino
        if (!(Test-Path $directorioDestino)) {
            New-Item -ItemType Directory -Path $directorioDestino -Force | Out-Null
        }

        # Copiar archivo
        Copy-Item -Path $archivo -Destination $destinoCompleto -Force
        Write-Host "Copiado: $archivo -> $destinoCompleto" -ForegroundColor Gray
        $copiados++
    } else {
        Write-Warning "El archivo '$archivo' no existe localmente (puede haber sido eliminado) y será omitido."
    }
}

Write-Host "`n¡Listo! Se copiaron exitosamente $copiados de $($archivos.Count) archivos a '$DestinationPath'." -ForegroundColor Green