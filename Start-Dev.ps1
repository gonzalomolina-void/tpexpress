<#
.SYNOPSIS
    Levanta el entorno de desarrollo en Docker Compose de forma controlada.
.DESCRIPTION
    Este script verifica que Docker este activo, detiene cualquier contenedor previo del proyecto
    para evitar conflictos de puertos, y levanta el entorno de desarrollo en segundo plano.
    Opcionalmente, permite levantar la aplicacion en modo Debug mapeando el puerto 9229.
.PARAMETER DebugMode
    Switch opcional. Si se especifica, la aplicacion web correra en modo debug usando nodemon --inspect.
.EXAMPLE
    .\Start-Dev.ps1
    Levanta el entorno en modo normal (pnpm run dev).
.EXAMPLE
    .\Start-Dev.ps1 -DebugMode
    Levanta el entorno en modo debug (pnpm run dev:debug).
#>
param (
    [switch]$DebugMode
)

# Forzar codificacion UTF-8 para evitar problemas de caracteres en consola
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "         TPEXPRESS - GESTOR DE DOCKER        " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Verificar que el motor de Docker este activo
Write-Host "Verificando el motor de Docker..." -ForegroundColor Gray
& docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "El motor de Docker no parece estar ejecutandose. Por favor, abri Docker Desktop y volve a intentarlo."
    exit 1
}
Write-Host "[OK] Docker esta activo." -ForegroundColor Green

# 2. Verificar contenedores del proyecto activos
Write-Host "Verificando contenedores del proyecto..." -ForegroundColor Gray
$runningContainers = & docker compose ps --services --filter "status=running" 2>$null

if ($runningContainers) {
    $joinedContainers = $runningContainers -join ', '
    Write-Host "Se detectaron contenedores activos: $joinedContainers" -ForegroundColor Yellow
    Write-Host "Apagando el entorno actual para arrancar limpio..." -ForegroundColor Cyan
    & docker compose down
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Error al apagar el entorno de Docker Compose."
        exit $LASTEXITCODE
    }
    Write-Host "[OK] Entorno previo apagado." -ForegroundColor Green
} else {
    Write-Host "[OK] El entorno ya estaba apagado." -ForegroundColor Green
}

# 3. Configurar variables de entorno segun el modo
if ($DebugMode) {
    Write-Host "`n[MODO DEBUG] Configurando puerto 9229..." -ForegroundColor Yellow
    $env:APP_START_SCRIPT = "dev:debug"
} else {
    Write-Host "`n[MODO NORMAL] Iniciando de forma estandar..." -ForegroundColor Cyan
    $env:APP_START_SCRIPT = "dev"
}

# 4. Levantar Docker Compose en segundo plano (detached)
Write-Host "Levantando contenedores en segundo plano..." -ForegroundColor Gray
& docker compose up -d
if ($LASTEXITCODE -ne 0) {
    # Limpiamos la variable por las dudas
    Remove-Item env:APP_START_SCRIPT -ErrorAction SilentlyContinue
    Write-Error "Error al ejecutar 'docker compose up -d'."
    exit $LASTEXITCODE
}

# Limpiar la variable de entorno de la sesion actual de PowerShell para que no quede basura
Remove-Item env:APP_START_SCRIPT -ErrorAction SilentlyContinue

# 5. Esperar a que los servicios esten sanos y listos
Write-Host "`nEsperando que los servicios esten listos..." -ForegroundColor Gray
$timeoutSeconds = 40
$elapsed = 0.0
$allHealthy = $false

# Spinner simple para feedback visual
$spinner = @('|', '/', '-', '\')
$spinnerIndex = 0

while ($elapsed -lt $timeoutSeconds) {
    Start-Sleep -Milliseconds 500
    $elapsed += 0.5
    
    # Obtener el estado actual de los contenedores
    $output = & docker compose ps --format json 2>$null
    $services = @()
    if ($output) {
        foreach ($line in $output) {
            if (![string]::IsNullOrWhiteSpace($line)) {
                try {
                    $services += $line | ConvertFrom-Json
                } catch {
                    # Ignorar errores de parsing si la salida es corrupta temporalmente
                }
            }
        }
    }
    
    # Validar estados de 'app' y 'db'
    if ($services.Count -gt 0) {
        $appService = $services | Where-Object { $_.Service -eq "app" }
        $dbService = $services | Where-Object { $_.Service -eq "db" }
        
        $appRunning = ($null -ne $appService) -and ($appService.State -eq "running")
        
        # db puede tener healthcheck (Health) o solo estar running (State)
        $dbReady = $false
        if ($null -ne $dbService) {
            if ($dbService.Health -eq "healthy") {
                $dbReady = $true
            } elseif ([string]::IsNullOrEmpty($dbService.Health) -and ($dbService.State -eq "running")) {
                $dbReady = $true
            }
        }
        
        if ($appRunning -and $dbReady) {
            $allHealthy = $true
            break
        }
    }
    
    # Dibujar spinner en la consola
    $char = $spinner[$spinnerIndex]
    Write-Host -NoNewline "`r$char Esperando inicializacion (Base de datos y Servidor)... $elapsed s"
    $spinnerIndex = ($spinnerIndex + 1) % $spinner.Count
}

# Limpiar la linea del spinner
Write-Host -NoNewline "`r                                                                                `r"

if ($allHealthy) {
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host " [OK] ENTORNO LEVANTADO EXITOSAMENTE!       " -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "- Aplicacion Web: http://localhost:3000" -ForegroundColor Gray
    if ($DebugMode) {
        Write-Host "- Debugger de Node escuchando en puerto 9229" -ForegroundColor Yellow
        Write-Host "- Ya podes conectar tu VS Code con la tarea 'Attach to Node (Docker)'!" -ForegroundColor Yellow
    }
} else {
    Write-Host "=============================================" -ForegroundColor Red
    Write-Host " [WARN] ADVERTENCIA: TIMEOUT EXCEDIDO        " -ForegroundColor Red
    Write-Host "=============================================" -ForegroundColor Red
    Write-Warning "Los servicios tardaron mas de $timeoutSeconds segundos en responder."
    Write-Warning "Es posible que la base de datos se este inicializando o haya algun problema."
    Write-Warning "Corre 'docker compose logs' para mas detalles."
}
