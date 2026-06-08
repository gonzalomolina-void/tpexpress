# self-contained API integration test script
$baseUrl = "http://localhost:3000"

# --- DB PRE-FLIGHT CHECKS ---
Write-Host "[CHECK] Verifying database connectivity and seed data..." -ForegroundColor Yellow

$dbCheckScript = @'
import 'dotenv/config';
import prisma from './src/prisma/prismaClient.js';
try {
    const count = await prisma.card.count();
    if (count === 0) {
        console.log("NO_SEED");
        process.exit(2);
    }
    console.log("OK");
    process.exit(0);
} catch (e) {
    if (e.code === 'ECONNREFUSED' || e.code === '57P01' || e.message.includes('Can-not-connect') || e.message.includes('connection') || e.message.includes('ECONNREFUSED')) {
        console.log("NO_CONN");
        process.exit(1);
    } else if (e.code === 'P1003' || (e.message.includes('database') && e.message.includes('does not exist'))) {
        console.log("NO_DB");
        process.exit(5);
    } else if (e.code === 'P2021' || e.message.includes('does not exist')) {
        console.log("NO_TABLES");
        process.exit(3);
    } else {
        console.log("UNKNOWN_ERROR:" + e.message);
        process.exit(4);
    }
}
'@

$tempScriptPath = "temp-check-db.js"
Set-Content -Path $tempScriptPath -Value $dbCheckScript

$process = Start-Process node -ArgumentList $tempScriptPath -NoNewWindow -PassThru -Wait
$exitCode = $process.ExitCode
Remove-Item -Path $tempScriptPath -Force

if ($exitCode -eq 1) {
    Write-Host "[ERROR] No se puede conectar a la base de datos." -ForegroundColor Red
    Write-Host "Asegurate de iniciar la base de datos (por ejemplo, ejecutando 'docker compose up -d db')." -ForegroundColor Yellow
    Exit 1
} elseif ($exitCode -eq 2) {
    Write-Host "[ERROR] La base de datos esta vacia (0 cartas)." -ForegroundColor Red
    Write-Host "Ejecuta las semillas para cargar los datos de prueba (por ejemplo, 'npx prisma db seed')." -ForegroundColor Yellow
    Exit 1
} elseif ($exitCode -eq 3) {
    Write-Host "[ERROR] Las tablas de la base de datos no existen." -ForegroundColor Red
    Write-Host "Ejecuta las migraciones de Prisma (por ejemplo, 'npx prisma migrate dev' o 'npx prisma db push')." -ForegroundColor Yellow
    Exit 1
} elseif ($exitCode -eq 5) {
    Write-Host "[ERROR] La base de datos especificada en el .env no existe en el servidor." -ForegroundColor Red
    Write-Host "Ejecuta las migraciones de Prisma para crearla y aplicar el esquema (por ejemplo, 'npx prisma migrate dev' o 'npx prisma db push')." -ForegroundColor Yellow
    Exit 1
} elseif ($exitCode -ne 0) {
    Write-Host "[ERROR] Ocurrio un error inesperado al conectar a la base de datos." -ForegroundColor Red
    Exit 1
}

Write-Host "[OK] Database is up and seeded!" -ForegroundColor Green

Write-Host "[START] Starting Express server in the background..." -ForegroundColor Cyan
$nodeProcess = Start-Process node -ArgumentList "src/index.js" -NoNewWindow -PassThru

# Wait for server to boot
Write-Host "[WAIT] Waiting for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

function Invoke-Api($method, $uri, $body = $null, $headers = $null) {
    $params = @{
        Uri = $uri
        Method = $method
        ContentType = "application/json"
        UseBasicParsing = $true
    }
    if ($PSVersionTable.PSVersion.Major -ge 6) {
        $params["SkipHttpErrorCheck"] = $true
    }
    if ($body) {
        $params["Body"] = $body
    }
    if ($headers) {
        $params["Headers"] = $headers
    }
    try {
        $res = Invoke-WebRequest @params
        return [PSCustomObject]@{
            StatusCode = $res.StatusCode
            Content = $res.Content
            Headers = $res.Headers
        }
    } catch {
        if ($_.Exception -and $_.Exception.Response) {
            $response = $_.Exception.Response
            $statusCode = [int]$response.StatusCode
            $content = ""
            if ($response.GetType().GetMethod("GetResponseStream")) {
                $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
                $content = $reader.ReadToEnd()
                $reader.Close()
            } elseif ($response.Content) {
                $content = $response.Content.ReadAsStringAsync().Result
            }
            return [PSCustomObject]@{
                StatusCode = $statusCode
                Content = $content
                Headers = $response.Headers
            }
        } else {
            return [PSCustomObject]@{
                StatusCode = 500
                Content = $_.Exception.Message
                Headers = @{}
            }
        }
    }
}

function Assert-Status($response, $expectedStatus, $testName) {
    $status = $response.StatusCode
    if ($status -eq $expectedStatus) {
        Write-Host "[PASS] $testName - PASSED (Status $status)" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] $testName - FAILED (Expected $expectedStatus, got $status)" -ForegroundColor Red
        Write-Host "Response Content: $($response.Content)" -ForegroundColor Red
    }
}

try {
    Write-Host "=== STARTING QA API TEST SUITE ===" -ForegroundColor Cyan

    # TC-01: GET /api/cards
    Write-Host "TC-01: GET /api/cards"
    $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards"
    Assert-Status $res 200 "TC-01: GET /api/cards"

    # TC-02: GET /api/cards?page=1&limit=5&lang=en
    Write-Host "TC-02: GET /api/cards?page=1&limit=5&lang=en"
    $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards?page=1&limit=5&lang=en"
    Assert-Status $res 200 "TC-02: GET /api/cards with pag/i18n"
    $totalCount = $res.Headers["X-Total-Count"]
    if ($totalCount) {
        Write-Host "  Header X-Total-Count present: $totalCount" -ForegroundColor Green
    } else {
        Write-Host "  Header X-Total-Count MISSING!" -ForegroundColor Red
    }
    if ($res.StatusCode -eq 200) {
        $cards = $res.Content | ConvertFrom-Json
        if ($cards.Count -gt 0) {
            $firstCard = $cards[0]
            if ($firstCard.type -in @("Creature", "Spell", "Artifact")) {
                Write-Host "  [PASS] Language mapping (EN) for type: $($firstCard.type)" -ForegroundColor Green
            } else {
                Write-Host "  [FAIL] Language mapping (EN) for type: Got $($firstCard.type)" -ForegroundColor Red
            }
            if ($firstCard.rarity -in @("Poor", "Common", "Uncommon", "Rare", "Epic", "Legendary")) {
                Write-Host "  [PASS] Language mapping (EN) for rarity: $($firstCard.rarity)" -ForegroundColor Green
            } else {
                Write-Host "  [FAIL] Language mapping (EN) for rarity: Got $($firstCard.rarity)" -ForegroundColor Red
            }
        }
    }

    # TC-03: POST /api/cards
    Write-Host "TC-03: POST /api/cards (Valid payload)"
    $body = @{
        cost = 3
        atk = 2
        def = 4
        image = "http://example.com/card.png"
        typeId = 1
        rarityId = 1
        translations = @(
            @{ language = "es"; name = "Dragon QA"; description = "Carta de prueba de QA" }
            @{ language = "en"; name = "QA Dragon"; description = "QA test card" }
        )
    } | ConvertTo-Json -Depth 5
    $res = Invoke-Api -Method Post -Uri "$baseUrl/api/cards" -Body $body
    Assert-Status $res 201 "TC-03: POST /api/cards"
    $createdId = $null
    if ($res.StatusCode -eq 201) {
        $card = $res.Content | ConvertFrom-Json
        $createdId = $card.id
        Write-Host "  Created Card ID: $createdId" -ForegroundColor Green
    }

    if ($null -ne $createdId) {
        # TC-04: GET /api/cards/:id
        Write-Host "TC-04: GET /api/cards/$createdId"
        $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards/$createdId"
        Assert-Status $res 200 "TC-04: GET /api/cards/:id"

        # TC-05: PUT /api/cards/:id
        Write-Host "TC-05: PUT /api/cards/$createdId (Update)"
        $bodyUpdate = @{
            cost = 4
            atk = 3
            def = 5
            image = "http://example.com/card-updated.png"
            typeId = 1
            rarityId = 1
            translations = @(
                @{ language = "es"; name = "Dragon QA Modificado"; description = "Modificada en prueba" }
                @{ language = "en"; name = "Updated QA Dragon"; description = "Updated in test" }
            )
        } | ConvertTo-Json -Depth 5
        $res = Invoke-Api -Method Put -Uri "$baseUrl/api/cards/$createdId" -Body $bodyUpdate
        Assert-Status $res 200 "TC-05: PUT /api/cards/:id"

        # TC-06: DELETE /api/cards/:id
        Write-Host "TC-06: DELETE /api/cards/$createdId"
        $res = Invoke-Api -Method Delete -Uri "$baseUrl/api/cards/$createdId"
        Assert-Status $res 200 "TC-06: DELETE /api/cards/:id"
    } else {
        Write-Host "Skipping TC-04, TC-05, TC-06 because card creation failed." -ForegroundColor Yellow
    }

    # TC-07: POST /api/cards with empty body
    Write-Host "TC-07: POST /api/cards (Empty body)"
    $res = Invoke-Api -Method Post -Uri "$baseUrl/api/cards" -Body "{}"
    Assert-Status $res 400 "TC-07: POST /api/cards (empty body)"

    # TC-08: POST /api/cards with invalid data
    Write-Host "TC-08: POST /api/cards (Invalid data: cost=-1)"
    $bodyInvalid = @{
        cost = -1
        atk = 2
        def = 4
        image = ""
        typeId = 1
        rarityId = 1
        translations = @()
    } | ConvertTo-Json -Depth 5
    $res = Invoke-Api -Method Post -Uri "$baseUrl/api/cards" -Body $bodyInvalid
    Assert-Status $res 400 "TC-08: POST /api/cards (invalid body)"

    # TC-09: GET /api/cards/abc (Invalid ID)
    Write-Host "TC-09: GET /api/cards/abc"
    $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards/abc"
    Assert-Status $res 400 "TC-09: GET /api/cards/abc"

    # TC-10: GET /api/cards/999999 (Non-existent ID)
    Write-Host "TC-10: GET /api/cards/999999"
    $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards/999999"
    Assert-Status $res 404 "TC-10: GET /api/cards/999999"

    # TC-11: PUT /api/cards/999999 (Non-existent ID)
    Write-Host "TC-11: PUT /api/cards/999999"
    $bodyUpdateEmpty = @{
        cost = 4
        atk = 3
        def = 5
        image = "http://example.com/card-updated.png"
        typeId = 1
        rarityId = 1
        translations = @(
            @{ language = "es"; name = "Dragon QA Modificado"; description = "Modificada en prueba" }
            @{ language = "en"; name = "Updated QA Dragon"; description = "Updated in test" }
        )
    } | ConvertTo-Json -Depth 5
    $res = Invoke-Api -Method Put -Uri "$baseUrl/api/cards/999999" -Body $bodyUpdateEmpty
    Assert-Status $res 404 "TC-11: PUT /api/cards/999999"

    # TC-12: DELETE /api/cards/999999 (Non-existent ID)
    Write-Host "TC-12: DELETE /api/cards/999999"
    $res = Invoke-Api -Method Delete -Uri "$baseUrl/api/cards/999999"
    Assert-Status $res 404 "TC-12: DELETE /api/cards/999999"

    # TC-13: CORS validation with Origin header
    Write-Host "TC-13: CORS validation with Origin header"
    $headersCors = @{
        "Origin" = "http://localhost:5173"
    }
    $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards" -headers $headersCors
    Assert-Status $res 200 "TC-13: CORS validation"
    $allowOrigin = $res.Headers["Access-Control-Allow-Origin"]
    if (-not $allowOrigin) { $allowOrigin = $res.Headers["access-control-allow-origin"] }
    $exposeHeaders = $res.Headers["Access-Control-Expose-Headers"]
    if (-not $exposeHeaders) { $exposeHeaders = $res.Headers["access-control-expose-headers"] }
    if ($allowOrigin -eq "http://localhost:5173") {
        Write-Host "  [PASS] Access-Control-Allow-Origin is correct: $allowOrigin" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Access-Control-Allow-Origin: Expected http://localhost:5173, got '$allowOrigin'" -ForegroundColor Red
    }
    if ($exposeHeaders -and $exposeHeaders.Contains("X-Total-Count")) {
        Write-Host "  [PASS] Access-Control-Expose-Headers contains X-Total-Count" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Access-Control-Expose-Headers: Expected to contain X-Total-Count, got '$exposeHeaders'" -ForegroundColor Red
    }

    # TC-14: CORS OPTIONS preflight request
    Write-Host "TC-14: CORS OPTIONS preflight request"
    $headersPreflight = @{
        "Origin" = "http://localhost:5173"
        "Access-Control-Request-Method" = "GET"
    }
    $res = Invoke-Api -Method Options -Uri "$baseUrl/api/cards" -headers $headersPreflight
    Assert-Status $res 200 "TC-14: CORS OPTIONS preflight"
    $allowOriginPreflight = $res.Headers["Access-Control-Allow-Origin"]
    if (-not $allowOriginPreflight) { $allowOriginPreflight = $res.Headers["access-control-allow-origin"] }
    if ($allowOriginPreflight -eq "http://localhost:5173") {
        Write-Host "  [PASS] Preflight Access-Control-Allow-Origin is correct: $allowOriginPreflight" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Preflight Access-Control-Allow-Origin: Expected http://localhost:5173, got '$allowOriginPreflight'" -ForegroundColor Red
    }

    # TC-15: i18n validation via Accept-Language header
    Write-Host "TC-15: i18n validation via Accept-Language header"
    $headersAcceptLang = @{
        "Accept-Language" = "en-US,en;q=0.9"
    }
    $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards?page=1&limit=5" -headers $headersAcceptLang
    Assert-Status $res 200 "TC-15: Accept-Language translation"
    if ($res.StatusCode -eq 200) {
        $cards = $res.Content | ConvertFrom-Json
        if ($cards.Count -gt 0) {
            $firstCard = $cards[0]
            if ($firstCard.type -in @("Creature", "Spell", "Artifact")) {
                Write-Host "  [PASS] Accept-Language translated type to English: $($firstCard.type)" -ForegroundColor Green
            } else {
                Write-Host "  [FAIL] Accept-Language translation: Got $($firstCard.type)" -ForegroundColor Red
            }
        }
    }

    Write-Host "=== QA API TEST SUITE COMPLETE ===" -ForegroundColor Cyan
} finally {
    # Clean up background server process
    if ($nodeProcess) {
        Write-Host "[STOP] Stopping Express server (PID: $($nodeProcess.Id))..." -ForegroundColor Cyan
        Stop-Process -Id $nodeProcess.Id -Force
    }
}
