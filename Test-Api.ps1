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

$process = Start-Process node -ArgumentList $tempScriptPath -WorkingDirectory $PSScriptRoot -NoNewWindow -PassThru -Wait
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

# --- CHECK IF EXPRESS SERVER IS ALREADY RUNNING ---
$serverAlreadyRunning = $false
try {
    # Check if we get a response from health endpoint
    $response = Invoke-WebRequest -Uri "$baseUrl/api/health" -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        $serverAlreadyRunning = $true
    }
} catch {
    # Ignore connection failure, server is not running
}

$nodeProcess = $null
if ($serverAlreadyRunning) {
    Write-Host "[OK] Express server is already running on $baseUrl. Reusing existing instance (Docker or Host)!" -ForegroundColor Green
} else {
    Write-Host "[START] Express server is not running. Starting local Express server in the background..." -ForegroundColor Cyan
    $nodeProcess = Start-Process node -ArgumentList "src/index.js" -WorkingDirectory $PSScriptRoot -RedirectStandardOutput "server.log" -RedirectStandardError "server-error.log" -NoNewWindow -PassThru

    # Wait for server to boot
    Write-Host "[WAIT] Waiting for server to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}


# Initialize global web session for cookie handling
$global:apiSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

function Invoke-Api($method, $uri, $body = $null, $headers = $null) {
    $params = @{
        Uri = $uri
        Method = $method
        ContentType = "application/json"
        UseBasicParsing = $true
        WebSession = $global:apiSession
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

    # Login as Admin to get Admin Token for write operations
    Write-Host "[SETUP] Logging in as Admin to get auth token..." -ForegroundColor Yellow
    $loginBody = @{
        email = "admin@example.com"
        password = "password123"
    } | ConvertTo-Json
    $loginRes = Invoke-Api -Method Post -Uri "$baseUrl/api/auth/login" -Body $loginBody
    $adminToken = $null
    if ($loginRes.StatusCode -eq 200) {
        $loginData = $loginRes.Content | ConvertFrom-Json
        $adminToken = $loginData.token
        Write-Host "[SETUP] Admin Token obtained successfully!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to log in as Admin. Status: $($loginRes.StatusCode)" -ForegroundColor Red
        Exit 1
    }
    $adminHeaders = @{
        "Authorization" = "Bearer $adminToken"
    }

    # TC-01: GET /api/cards
    Write-Host "TC-01: GET /api/cards"
    $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards" -headers $adminHeaders
    Assert-Status $res 200 "TC-01: GET /api/cards"

    # TC-02: GET /api/cards?page=1&limit=5&lang=en
    Write-Host "TC-02: GET /api/cards?page=1&limit=5&lang=en"
    $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards?page=1&limit=5&lang=en" -headers $adminHeaders
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

    # TC-03a: POST /api/cards sin autenticación (debe dar 401)
    Write-Host "TC-03a: POST /api/cards sin token"
    $global:apiSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $resNoAuth = Invoke-Api -Method Post -Uri "$baseUrl/api/cards" -Body $body
    Assert-Status $resNoAuth 401 "TC-03a: POST /api/cards sin token"

    # TC-03: POST /api/cards con token de administrador (debe dar 201)
    $res = Invoke-Api -Method Post -Uri "$baseUrl/api/cards" -Body $body -headers $adminHeaders
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
        $res = Invoke-Api -Method Put -Uri "$baseUrl/api/cards/$createdId" -Body $bodyUpdate -headers $adminHeaders
        Assert-Status $res 200 "TC-05: PUT /api/cards/:id"

        # TC-06: DELETE /api/cards/:id
        Write-Host "TC-06: DELETE /api/cards/$createdId"
        $res = Invoke-Api -Method Delete -Uri "$baseUrl/api/cards/$createdId" -headers $adminHeaders
        Assert-Status $res 200 "TC-06: DELETE /api/cards/:id"
    } else {
        Write-Host "Skipping TC-04, TC-05, TC-06 because card creation failed." -ForegroundColor Yellow
    }

    # TC-07: POST /api/cards with empty body
    Write-Host "TC-07: POST /api/cards (Empty body)"
    $res = Invoke-Api -Method Post -Uri "$baseUrl/api/cards" -Body "{}" -headers $adminHeaders
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
    $res = Invoke-Api -Method Post -Uri "$baseUrl/api/cards" -Body $bodyInvalid -headers $adminHeaders
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
    $res = Invoke-Api -Method Put -Uri "$baseUrl/api/cards/999999" -Body $bodyUpdateEmpty -headers $adminHeaders
    Assert-Status $res 404 "TC-11: PUT /api/cards/999999"

    # TC-12: DELETE /api/cards/999999 (Non-existent ID)
    Write-Host "TC-12: DELETE /api/cards/999999"
    $res = Invoke-Api -Method Delete -Uri "$baseUrl/api/cards/999999" -headers $adminHeaders
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

    # TC-16: Search validation (search=Kaelen)
    Write-Host "TC-16: GET /api/cards?search=Kaelen"
    $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards?search=Kaelen&lang=en"
    Assert-Status $res 200 "TC-16: Search by card name"
    if ($res.StatusCode -eq 200) {
        $cards = $res.Content | ConvertFrom-Json
        if ($cards.Count -gt 0) {
            $match = $true
            foreach ($card in $cards) {
                if ($card.name -notmatch "Kaelen") {
                    $match = $false
                    Write-Host "  [FAIL] Card does not match search criteria: $($card.name)" -ForegroundColor Red
                }
            }
            if ($match) {
                Write-Host "  [PASS] All returned cards match search criteria 'Kaelen'" -ForegroundColor Green
            }
        } else {
            Write-Host "  [FAIL] Search returned 0 cards, expected at least Sir Kaelen." -ForegroundColor Red
        }
    }

    # TC-17: Filter validation by Type (type=artifact)
    Write-Host "TC-17: GET /api/cards?type=artifact"
    $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards?type=artifact&lang=en"
    Assert-Status $res 200 "TC-17: Filter by Type"
    if ($res.StatusCode -eq 200) {
        $cards = $res.Content | ConvertFrom-Json
        if ($cards.Count -gt 0) {
            $match = $true
            foreach ($card in $cards) {
                if ($card.type -ne "Artifact") {
                    $match = $false
                    Write-Host "  [FAIL] Card has incorrect type: $($card.type), expected Artifact" -ForegroundColor Red
                }
            }
            if ($match) {
                Write-Host "  [PASS] All returned cards have type 'Artifact'" -ForegroundColor Green
            }
        } else {
            Write-Host "  [FAIL] Filter returned 0 cards, expected at least one Artifact." -ForegroundColor Red
        }
    }

    # TC-18: Filter validation by Rarity (rarity=legendary)
    Write-Host "TC-18: GET /api/cards?rarity=legendary"
    $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards?rarity=legendary&lang=en"
    Assert-Status $res 200 "TC-18: Filter by Rarity"
    if ($res.StatusCode -eq 200) {
        $cards = $res.Content | ConvertFrom-Json
        if ($cards.Count -gt 0) {
            $match = $true
            foreach ($card in $cards) {
                if ($card.rarity -ne "Legendary") {
                    $match = $false
                    Write-Host "  [FAIL] Card has incorrect rarity: $($card.rarity), expected Legendary" -ForegroundColor Red
                }
            }
            if ($match) {
                Write-Host "  [PASS] All returned cards have rarity 'Legendary'" -ForegroundColor Green
            }
        } else {
            Write-Host "  [FAIL] Filter returned 0 cards, expected at least one Legendary card." -ForegroundColor Red
        }
    }

    # TC-19: Combined validation (search=Lyra&type=creature&rarity=rare)
    Write-Host "TC-19: GET /api/cards?search=Lyra&type=creature&rarity=rare"
    $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards?search=Lyra&type=creature&rarity=rare&lang=en"
    Assert-Status $res 200 "TC-19: Combined filters (search, type, rarity)"
    if ($res.StatusCode -eq 200) {
        $cards = $res.Content | ConvertFrom-Json
        if ($cards.Count -eq 1 -and $cards[0].name -eq "Lyra") {
            Write-Host "  [PASS] Combined filters correctly returned exactly 'Lyra'" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] Expected exactly 'Lyra', got $($cards.Count) cards." -ForegroundColor Red
        }
    }

    # TC-20: POST /api/auth/register (New user with role 'usuario' by default)
    Write-Host "TC-20: POST /api/auth/register"
    $registerEmail = "qanewuser_" + (Get-Date -Format "yyyyMMddHHmmss") + "@example.com"
    $bodyRegister = @{
        email = $registerEmail
        password = "password123"
    } | ConvertTo-Json
    $res = Invoke-Api -Method Post -Uri "$baseUrl/api/auth/register" -Body $bodyRegister
    Assert-Status $res 201 "TC-20: POST /api/auth/register"
    if ($res.StatusCode -eq 201) {
        $regUser = $res.Content | ConvertFrom-Json
        if ($regUser.role -eq "usuario") {
            Write-Host "  [PASS] Default role is 'usuario': $($regUser.role)" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] Expected default role 'usuario', got '$($regUser.role)'" -ForegroundColor Red
        }
    }

    # TC-21: POST /api/auth/login (Login and check role in response and JWT token payload)
    Write-Host "TC-21: POST /api/auth/login"
    $bodyLogin = @{
        email = "admin@example.com"
        password = "password123"
    } | ConvertTo-Json
    $res = Invoke-Api -Method Post -Uri "$baseUrl/api/auth/login" -Body $bodyLogin
    Assert-Status $res 200 "TC-21: POST /api/auth/login"
    if ($res.StatusCode -eq 200) {
        $loginRes = $res.Content | ConvertFrom-Json
        if ($loginRes.user.role -eq "admin") {
            Write-Host "  [PASS] Login response contains role 'admin': $($loginRes.user.role)" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] Expected role 'admin' in login response, got '$($loginRes.user.role)'" -ForegroundColor Red
        }
        
        # Verify JWT Token contains the role
        $tokenParts = $loginRes.token.Split('.')
        if ($tokenParts.Length -eq 3) {
            # Decode payload (base64url)
            $payloadBase64 = $tokenParts[1].Replace('-', '+').Replace('_', '/')
            # Pad base64 if needed
            while ($payloadBase64.Length % 4) { $payloadBase64 += "=" }
            $payloadJsonBytes = [System.Convert]::FromBase64String($payloadBase64)
            $payloadJson = [System.Text.Encoding]::UTF8.GetString($payloadJsonBytes)
            $payload = $payloadJson | ConvertFrom-Json
            if ($payload.role -eq "admin") {
                Write-Host "  [PASS] JWT Token payload contains correct role 'admin'" -ForegroundColor Green
            } else {
                Write-Host "  [FAIL] Expected role 'admin' in JWT payload, got '$($payload.role)'" -ForegroundColor Red
            }
        } else {
            Write-Host "  [FAIL] Invalid JWT token structure returned!" -ForegroundColor Red
        }
    }

    # TC-22: Authorization check (User with role 'usuario' gets 403 Forbidden on POST /api/cards)
    Write-Host "TC-22: POST /api/cards with regular user token (debe dar 403)"
    $userLoginBody = @{
        email = "integration@test.com"
        password = "password123"
    } | ConvertTo-Json
    $userLoginRes = Invoke-Api -Method Post -Uri "$baseUrl/api/auth/login" -Body $userLoginBody
    if ($userLoginRes.StatusCode -eq 200) {
        $userData = $userLoginRes.Content | ConvertFrom-Json
        $userHeaders = @{
            "Authorization" = "Bearer $($userData.token)"
        }
        $forbiddenRes = Invoke-Api -Method Post -Uri "$baseUrl/api/cards" -Body $body -headers $userHeaders
        Assert-Status $forbiddenRes 403 "TC-22: POST /api/cards with regular user token"
    } else {
        Write-Host "  [FAIL] Failed to log in as regular user for authorization test." -ForegroundColor Red
    }

    # --- REFRESH TOKEN TESTS ---
    Write-Host "=== STARTING REFRESH TOKEN QA TESTS ===" -ForegroundColor Cyan

    # Login to establish active session and get refreshToken cookie in WebSession
    Write-Host "[SETUP] Logging in to establish session with refresh token..." -ForegroundColor Yellow
    $loginBody = @{
        email = "integration@test.com"
        password = "password123"
    } | ConvertTo-Json
    $loginRes = Invoke-Api -Method Post -Uri "$baseUrl/api/auth/login" -Body $loginBody
    Assert-Status $loginRes 200 "Login as integration user"

    # TC-23: POST /api/auth/refresh (Valid Token via WebSession)
    Write-Host "TC-23: POST /api/auth/refresh (Valid Session Cookie)"
    $refreshRes = Invoke-Api -Method Post -Uri "$baseUrl/api/auth/refresh"
    Assert-Status $refreshRes 200 "TC-23: POST /api/auth/refresh"
    if ($refreshRes.StatusCode -eq 200) {
        $refreshData = $refreshRes.Content | ConvertFrom-Json
        if ($refreshData.token) {
            Write-Host "  [PASS] New Access Token obtained successfully!" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] Response body does not contain new token!" -ForegroundColor Red
        }
    }

    # TC-24a: POST /api/auth/refresh (Without Cookie)
    Write-Host "TC-24a: POST /api/auth/refresh without Cookie"
    # Backup current session and use a clean session
    $backupSession = $global:apiSession
    $global:apiSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    
    $resNoCookie = Invoke-Api -Method Post -Uri "$baseUrl/api/auth/refresh"
    Assert-Status $resNoCookie 401 "TC-24a: POST /api/auth/refresh without Cookie"
    
    # Restore session
    $global:apiSession = $backupSession

    # TC-24b: POST /api/auth/refresh (With Invalid Cookie)
    Write-Host "TC-24b: POST /api/auth/refresh with invalid Cookie"
    $invalidSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $invalidCookie = New-Object System.Net.Cookie("refreshToken", "thisisnotarealtoken12345", "/", "localhost")
    $invalidSession.Cookies.Add($invalidCookie)
    
    $global:apiSession = $invalidSession
    $resInvalidCookie = Invoke-Api -Method Post -Uri "$baseUrl/api/auth/refresh"
    Assert-Status $resInvalidCookie 401 "TC-24b: POST /api/auth/refresh with invalid Cookie"
    
    # Restore session
    $global:apiSession = $backupSession

    # TC-25: POST /api/auth/logout (Valid Session Cookie)
    Write-Host "TC-25: POST /api/auth/logout (Valid Cookie)"
    $logoutRes = Invoke-Api -Method Post -Uri "$baseUrl/api/auth/logout"
    Assert-Status $logoutRes 200 "TC-25: POST /api/auth/logout"

    # TC-26: POST /api/auth/refresh (After Logout - Revoked Token)
    Write-Host "TC-26: POST /api/auth/refresh (After Logout)"
    # The session still contains the cookie (though cleared or expired by clearCookie)
    # Let's perform the refresh. It should fail since the database record is revoked.
    $revokedRes = Invoke-Api -Method Post -Uri "$baseUrl/api/auth/refresh"
    Assert-Status $revokedRes 401 "TC-26: POST /api/auth/refresh with revoked cookie"

    # Clean up the session for subsequent tests
    $global:apiSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

    # TC-27: GET /api/cards/:id/edit (Admin - Exitoso)
    Write-Host "TC-27: GET /api/cards/1/edit (Admin)"
    $resEditAdmin = Invoke-Api -Method Get -Uri "$baseUrl/api/cards/1/edit" -headers $adminHeaders
    Assert-Status $resEditAdmin 200 "TC-27: GET /api/cards/1/edit (Admin)"
    if ($resEditAdmin.StatusCode -eq 200) {
        $editCard = $resEditAdmin.Content | ConvertFrom-Json
        if ($editCard.translations -and $editCard.translations.es -and $editCard.translations.es.name) {
            Write-Host "  [PASS] translations dictionary mapping verified: $($editCard.translations.es.name)" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] translations dictionary missing or malformed!" -ForegroundColor Red
        }
        if ($editCard.typeCode -eq "creature") {
            Write-Host "  [PASS] typeCode mapping verified: $($editCard.typeCode)" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] typeCode missing or incorrect: $($editCard.typeCode)" -ForegroundColor Red
        }
    }

    # TC-28: GET /api/cards/:id/edit (Regular User - Debe dar 403)
    Write-Host "TC-28: GET /api/cards/1/edit with regular user (debe dar 403)"
    $resEditUser = Invoke-Api -Method Get -Uri "$baseUrl/api/cards/1/edit" -headers $userHeaders
    Assert-Status $resEditUser 403 "TC-28: GET /api/cards/1/edit (User)"

    # TC-29: GET /api/cards/:id/edit (Sin token - Debe dar 401)
    Write-Host "TC-29: GET /api/cards/1/edit without token (debe dar 401)"
    # Clean up session to send no cookie
    $backupSession = $global:apiSession
    $global:apiSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $resEditNoAuth = Invoke-Api -Method Get -Uri "$baseUrl/api/cards/1/edit"
    Assert-Status $resEditNoAuth 401 "TC-29: GET /api/cards/1/edit (No Auth)"
    $global:apiSession = $backupSession

    # TC-30: GET /api/types (Authenticated)
    Write-Host "TC-30: GET /api/types (Authenticated)"
    $resTypes = Invoke-Api -Method Get -Uri "$baseUrl/api/types" -headers $adminHeaders
    Assert-Status $resTypes 200 "TC-30: GET /api/types"
    if ($resTypes.StatusCode -eq 200) {
        $types = $resTypes.Content | ConvertFrom-Json
        if ($types.Count -gt 0) {
            $firstType = $types[0]
            if ($null -ne $firstType.id -and $null -ne $firstType.code -and $null -ne $firstType.name -and $null -ne $firstType.labelKey) {
                Write-Host "  [PASS] Types fields structure is correct (id, code, name, labelKey)" -ForegroundColor Green
            } else {
                Write-Host "  [FAIL] Types structure invalid: $($resTypes.Content)" -ForegroundColor Red
            }
        } else {
            Write-Host "  [FAIL] Returned empty list of types!" -ForegroundColor Red
        }
    }

    # TC-31: GET /api/types sin token (debe dar 401)
    Write-Host "TC-31: GET /api/types sin token (debe dar 401)"
    $backupSession = $global:apiSession
    $global:apiSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $resTypesNoAuth = Invoke-Api -Method Get -Uri "$baseUrl/api/types"
    Assert-Status $resTypesNoAuth 401 "TC-31: GET /api/types sin token"
    $global:apiSession = $backupSession

    # TC-32: GET /api/types con internacionalización (?lang=en)
    Write-Host "TC-32: GET /api/types?lang=en (i18n)"
    $resTypesEn = Invoke-Api -Method Get -Uri "$baseUrl/api/types?lang=en" -headers $adminHeaders
    Assert-Status $resTypesEn 200 "TC-32: GET /api/types?lang=en"
    if ($resTypesEn.StatusCode -eq 200) {
        $typesEn = $resTypesEn.Content | ConvertFrom-Json
        $creatureType = $typesEn | Where-Object { $_.code -eq "creature" }
        if ($creatureType -and $creatureType.name -eq "Creature") {
            Write-Host "  [PASS] Dynamic translation for type 'creature' matches 'Creature'" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] i18n translation failed or missing. Got: $($creatureType | ConvertTo-Json)" -ForegroundColor Red
        }
    }

    # TC-33: GET /api/rarities (Authenticated)
    Write-Host "TC-33: GET /api/rarities (Authenticated)"
    $resRarities = Invoke-Api -Method Get -Uri "$baseUrl/api/rarities" -headers $adminHeaders
    Assert-Status $resRarities 200 "TC-33: GET /api/rarities"
    if ($resRarities.StatusCode -eq 200) {
        $rarities = $resRarities.Content | ConvertFrom-Json
        if ($rarities.Count -gt 0) {
            $firstRarity = $rarities[0]
            if ($null -ne $firstRarity.id -and $null -ne $firstRarity.code -and $null -ne $firstRarity.name -and $null -ne $firstRarity.labelKey) {
                Write-Host "  [PASS] Rarities fields structure is correct (id, code, name, labelKey)" -ForegroundColor Green
            } else {
                Write-Host "  [FAIL] Rarities structure invalid: $($resRarities.Content)" -ForegroundColor Red
            }
        } else {
            Write-Host "  [FAIL] Returned empty list of rarities!" -ForegroundColor Red
        }
    }

    # TC-34: GET /api/rarities sin token (debe dar 401)
    Write-Host "TC-34: GET /api/rarities sin token (debe dar 401)"
    $backupSession = $global:apiSession
    $global:apiSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $resRaritiesNoAuth = Invoke-Api -Method Get -Uri "$baseUrl/api/rarities"
    Assert-Status $resRaritiesNoAuth 401 "TC-34: GET /api/rarities sin token"
    $global:apiSession = $backupSession

    # TC-35: GET /api/rarities con internacionalización (Accept-Language: en)
    Write-Host "TC-35: GET /api/rarities with Accept-Language: en (i18n)"
    $headersAcceptLangEn = @{
        "Authorization" = "Bearer $adminToken"
        "Accept-Language" = "en"
    }
    $resRaritiesEn = Invoke-Api -Method Get -Uri "$baseUrl/api/rarities" -headers $headersAcceptLangEn
    Assert-Status $resRaritiesEn 200 "TC-35: GET /api/rarities with Accept-Language: en"
    if ($resRaritiesEn.StatusCode -eq 200) {
        $raritiesEn = $resRaritiesEn.Content | ConvertFrom-Json
        $legendaryRarity = $raritiesEn | Where-Object { $_.code -eq "legendary" }
        if ($legendaryRarity -and $legendaryRarity.name -eq "Legendary") {
            Write-Host "  [PASS] Dynamic translation for rarity 'legendary' matches 'Legendary'" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] i18n translation failed or missing. Got: $($legendaryRarity | ConvertTo-Json)" -ForegroundColor Red
        }
    }

    Write-Host "=== QA API TEST SUITE COMPLETE ===" -ForegroundColor Cyan
} finally {
    # Clean up background server process
    if ($nodeProcess) {
        Write-Host "[STOP] Stopping Express server (PID: $($nodeProcess.Id))..." -ForegroundColor Cyan
        Stop-Process -Id $nodeProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
