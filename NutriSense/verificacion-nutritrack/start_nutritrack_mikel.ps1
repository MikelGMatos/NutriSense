# start_nutritrack_mikel.ps1
# Script personalizado para la estructura de Mikel

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    INICIANDO NUTRITRACK - MIKEL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Colores y funciones
function Write-Status {
    param(
        [string]$Status,
        [string]$Message
    )
    
    switch ($Status) {
        "success" { Write-Host "[✓] $Message" -ForegroundColor Green }
        "error"   { Write-Host "[✗] $Message" -ForegroundColor Red }
        "warning" { Write-Host "[⚠] $Message" -ForegroundColor Yellow }
        "info"    { Write-Host "[ℹ] $Message" -ForegroundColor Blue }
    }
}

function Test-Port {
    param($Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

# 1. Verificar MongoDB
Write-Host "1. Verificando MongoDB..." -ForegroundColor Yellow
Write-Host ""

$mongoRunning = Test-Port -Port 27017
if ($mongoRunning) {
    Write-Status "success" "MongoDB está corriendo en puerto 27017"
} else {
    Write-Status "error" "MongoDB no está accesible"
    Write-Status "info" "Ejecuta: net start MongoDB (como administrador)"
}

Write-Host ""

# 2. Verificar MySQL
Write-Host "2. Verificando MySQL..." -ForegroundColor Yellow
Write-Host ""

$mysqlRunning = Test-Port -Port 3306
if ($mysqlRunning) {
    Write-Status "success" "MySQL está corriendo en puerto 3306"
} else {
    Write-Status "warning" "MySQL no está accesible en puerto 3306"
}

Write-Host ""

# 3. Iniciar Backend Node.js
Write-Host "3. Iniciando Backend Node.js (puerto 3001)..." -ForegroundColor Yellow
Write-Host ""

$nodeBackendPath = ".\backend\service-node"

if (Test-Path $nodeBackendPath) {
    $nodeRunning = Test-Port -Port 3001
    
    if ($nodeRunning) {
        Write-Status "warning" "El puerto 3001 ya está en uso"
    } else {
        Write-Status "info" "Abriendo ventana para Backend Node.js..."
        
        $nodeStartCommand = @"
cd '$nodeBackendPath'
Write-Host '════════════════════════════════════════' -ForegroundColor Cyan
Write-Host '  BACKEND NODE.JS - Puerto 3001' -ForegroundColor Cyan
Write-Host '════════════════════════════════════════' -ForegroundColor Cyan
Write-Host ''
npm start
"@
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $nodeStartCommand
        Start-Sleep -Seconds 5
        
        if (Test-Port -Port 3001) {
            Write-Status "success" "Backend Node.js iniciado en http://localhost:3001"
        } else {
            Write-Status "warning" "Backend Node.js iniciándose... (puede tardar unos segundos)"
        }
    }
} else {
    Write-Status "error" "No se encontró: $nodeBackendPath"
}

Write-Host ""

# 4. Iniciar Backend Python
Write-Host "4. Iniciando Backend Python FastAPI (puerto 8000)..." -ForegroundColor Yellow
Write-Host ""

$pythonBackendPath = ".\backend\service-python"

if (Test-Path $pythonBackendPath) {
    $pythonRunning = Test-Port -Port 8000
    
    if ($pythonRunning) {
        Write-Status "warning" "El puerto 8000 ya está en uso"
    } else {
        Write-Status "info" "Abriendo ventana para Backend Python..."
        
        # Verificar si existe entorno virtual
        $venvPath = Join-Path $pythonBackendPath "venv\Scripts\activate.ps1"
        
        if (Test-Path $venvPath) {
            $pythonStartCommand = @"
cd '$pythonBackendPath'
Write-Host '════════════════════════════════════════' -ForegroundColor Cyan
Write-Host '  BACKEND PYTHON - Puerto 8000' -ForegroundColor Cyan
Write-Host '════════════════════════════════════════' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Activando entorno virtual...' -ForegroundColor Yellow
.\venv\Scripts\activate
Write-Host 'Iniciando servidor FastAPI...' -ForegroundColor Yellow
Write-Host ''
python main.py
"@
        } else {
            $pythonStartCommand = @"
cd '$pythonBackendPath'
Write-Host '════════════════════════════════════════' -ForegroundColor Cyan
Write-Host '  BACKEND PYTHON - Puerto 8000' -ForegroundColor Cyan
Write-Host '════════════════════════════════════════' -ForegroundColor Cyan
Write-Host ''
Write-Host 'NOTA: No se encontró entorno virtual' -ForegroundColor Yellow
Write-Host 'Iniciando con Python global...' -ForegroundColor Yellow
Write-Host ''
python main.py
"@
        }
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $pythonStartCommand
        Start-Sleep -Seconds 5
        
        if (Test-Port -Port 8000) {
            Write-Status "success" "Backend Python iniciado en http://localhost:8000"
            Write-Status "info" "Documentación API: http://localhost:8000/docs"
        } else {
            Write-Status "warning" "Backend Python iniciándose... (puede tardar unos segundos)"
        }
    }
} else {
    Write-Status "error" "No se encontró: $pythonBackendPath"
}

Write-Host ""

# 5. Iniciar Frontend React
Write-Host "5. Iniciando Frontend React (puerto 5173)..." -ForegroundColor Yellow
Write-Host ""

$frontendPath = ".\frontend"

if (Test-Path $frontendPath) {
    $frontendRunning = Test-Port -Port 5173
    
    if ($frontendRunning) {
        Write-Status "warning" "El puerto 5173 ya está en uso"
    } else {
        Write-Status "info" "Abriendo ventana para Frontend React..."
        
        $frontendStartCommand = @"
cd '$frontendPath'
Write-Host '════════════════════════════════════════' -ForegroundColor Cyan
Write-Host '  FRONTEND REACT - Puerto 5173' -ForegroundColor Cyan
Write-Host '════════════════════════════════════════' -ForegroundColor Cyan
Write-Host ''
npm run dev
"@
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendStartCommand
        Start-Sleep -Seconds 5
        
        if (Test-Port -Port 5173) {
            Write-Status "success" "Frontend React iniciado en http://localhost:5173"
        } else {
            Write-Status "warning" "Frontend React iniciándose... (puede tardar unos segundos)"
        }
    }
} else {
    Write-Status "error" "No se encontró: $frontendPath"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    RESUMEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Estado de los servicios:" -ForegroundColor White
Write-Host ""

Write-Host "  🗄️  Bases de Datos:" -ForegroundColor Cyan
Write-Host "  • MongoDB:         " -NoNewline
if (Test-Port -Port 27017) { Write-Host "✓ Corriendo" -ForegroundColor Green } else { Write-Host "✗ Detenido" -ForegroundColor Red }

Write-Host "  • MySQL:           " -NoNewline
if (Test-Port -Port 3306) { Write-Host "✓ Corriendo" -ForegroundColor Green } else { Write-Host "✗ Detenido" -ForegroundColor Red }

Write-Host ""
Write-Host "  ⚙️  Servicios Backend:" -ForegroundColor Cyan
Write-Host "  • Node.js (3001):  " -NoNewline
if (Test-Port -Port 3001) { Write-Host "✓ http://localhost:3001" -ForegroundColor Green } else { Write-Host "✗ No disponible" -ForegroundColor Red }

Write-Host "  • Python (8000):   " -NoNewline
if (Test-Port -Port 8000) { Write-Host "✓ http://localhost:8000" -ForegroundColor Green } else { Write-Host "✗ No disponible" -ForegroundColor Red }

Write-Host ""
Write-Host "  🎨 Frontend:" -ForegroundColor Cyan
Write-Host "  • React (5173):    " -NoNewline
if (Test-Port -Port 5173) { Write-Host "✓ http://localhost:5173" -ForegroundColor Green } else { Write-Host "✗ No disponible" -ForegroundColor Red }

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Verificar si todo está OK
$allOk = (Test-Port -Port 27017) -and (Test-Port -Port 3306) -and (Test-Port -Port 3001) -and (Test-Port -Port 8000) -and (Test-Port -Port 5173)

if ($allOk) {
    Write-Host "  ✅ SISTEMA COMPLETAMENTE OPERATIVO" -ForegroundColor Green
    Write-Host ""
    Write-Host "  🌐 Abre tu navegador en:" -ForegroundColor Cyan
    Write-Host "     http://localhost:5173" -ForegroundColor White
    Write-Host ""
    Write-Host "  📚 Documentación API:" -ForegroundColor Cyan
    Write-Host "     http://localhost:8000/docs" -ForegroundColor White
} else {
    Write-Host "  ⚠️  ALGUNOS SERVICIOS NO ESTÁN DISPONIBLES" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Espera 10-15 segundos y vuelve a verificar" -ForegroundColor Yellow
    Write-Host "  Los servicios pueden tardar en iniciarse completamente" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Para verificar el estado actual, ejecuta:" -ForegroundColor Cyan
    Write-Host "     node verificacion-nutritrack/verify_system.js" -ForegroundColor White
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Status "info" "Las ventanas de los servicios permanecerán abiertas"
Write-Status "info" "Presiona Ctrl+C en cada ventana para detener ese servicio"
Write-Host ""

# Esperar a que el usuario presione una tecla
Write-Host "Presiona cualquier tecla para cerrar esta ventana..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
