# start_nutritrack.ps1
# Script para iniciar todos los servicios de NutriTrack en Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    INICIANDO NUTRITRACK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar si un puerto está en uso
function Test-Port {
    param($Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

# Función para imprimir mensajes con color
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

# 1. Verificar y iniciar MongoDB
Write-Host "1. Verificando MongoDB..." -ForegroundColor Yellow
Write-Host ""

$mongoRunning = Test-Port -Port 27017

if ($mongoRunning) {
    Write-Status "success" "MongoDB ya está corriendo en puerto 27017"
} else {
    Write-Status "warning" "MongoDB no está corriendo. Intentando iniciar..."
    
    # Intentar iniciar como servicio
    try {
        Start-Service MongoDB -ErrorAction Stop
        Start-Sleep -Seconds 3
        $mongoRunning = Test-Port -Port 27017
        
        if ($mongoRunning) {
            Write-Status "success" "MongoDB iniciado exitosamente"
        } else {
            Write-Status "error" "No se pudo iniciar MongoDB como servicio"
            Write-Status "info" "Intenta iniciarlo manualmente: net start MongoDB"
        }
    } catch {
        Write-Status "error" "MongoDB no está instalado como servicio"
        Write-Status "info" "Inicia MongoDB manualmente desde su carpeta de instalación"
    }
}

Write-Host ""

# 2. Verificar MySQL
Write-Host "2. Verificando MySQL..." -ForegroundColor Yellow
Write-Host ""

$mysqlRunning = Test-Port -Port 3306

if ($mysqlRunning) {
    Write-Status "success" "MySQL ya está corriendo en puerto 3306"
} else {
    Write-Status "warning" "MySQL no está corriendo. Intentando iniciar..."
    
    # Buscar el servicio MySQL (puede tener diferentes nombres)
    $mysqlService = Get-Service | Where-Object { $_.Name -like "MySQL*" } | Select-Object -First 1
    
    if ($mysqlService) {
        try {
            Start-Service $mysqlService.Name -ErrorAction Stop
            Start-Sleep -Seconds 3
            Write-Status "success" "MySQL iniciado exitosamente"
        } catch {
            Write-Status "error" "No se pudo iniciar MySQL"
        }
    } else {
        Write-Status "error" "Servicio MySQL no encontrado"
        Write-Status "info" "Verifica que MySQL esté instalado"
    }
}

Write-Host ""

# 3. Iniciar Backend Node.js
Write-Host "3. Iniciando Backend Node.js (puerto 3001)..." -ForegroundColor Yellow
Write-Host ""

$nodeBackendPath = ".\nutritrack-backend"
if (-not (Test-Path $nodeBackendPath)) {
    $nodeBackendPath = ".\service-node"
}

if (Test-Path $nodeBackendPath) {
    # Verificar si ya está corriendo
    $nodeRunning = Test-Port -Port 3001
    
    if ($nodeRunning) {
        Write-Status "warning" "El puerto 3001 ya está en uso"
        Write-Status "info" "Si es el backend Node.js, ya está corriendo"
    } else {
        Write-Status "info" "Abriendo nueva ventana para Backend Node.js..."
        
        $nodeStartCommand = @"
cd '$nodeBackendPath'
Write-Host 'Iniciando Backend Node.js...' -ForegroundColor Cyan
npm start
"@
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $nodeStartCommand
        Start-Sleep -Seconds 5
        
        if (Test-Port -Port 3001) {
            Write-Status "success" "Backend Node.js iniciado en http://localhost:3001"
        } else {
            Write-Status "warning" "Backend Node.js puede estar iniciándose..."
        }
    }
} else {
    Write-Status "error" "No se encontró la carpeta del backend Node.js"
    Write-Status "info" "Asegúrate de ejecutar este script desde la raíz del proyecto"
}

Write-Host ""

# 4. Iniciar Backend Python
Write-Host "4. Iniciando Backend Python FastAPI (puerto 8000)..." -ForegroundColor Yellow
Write-Host ""

$pythonBackendPath = ".\nutritrack-food-service"
if (-not (Test-Path $pythonBackendPath)) {
    $pythonBackendPath = ".\service-python"
}

if (Test-Path $pythonBackendPath) {
    # Verificar si ya está corriendo
    $pythonRunning = Test-Port -Port 8000
    
    if ($pythonRunning) {
        Write-Status "warning" "El puerto 8000 ya está en uso"
        Write-Status "info" "Si es el backend Python, ya está corriendo"
    } else {
        Write-Status "info" "Abriendo nueva ventana para Backend Python..."
        
        # Verificar si existe entorno virtual
        $venvPath = Join-Path $pythonBackendPath "venv\Scripts\activate.ps1"
        
        if (Test-Path $venvPath) {
            $pythonStartCommand = @"
cd '$pythonBackendPath'
Write-Host 'Activando entorno virtual...' -ForegroundColor Cyan
.\venv\Scripts\activate
Write-Host 'Iniciando Backend Python...' -ForegroundColor Cyan
python main.py
"@
        } else {
            $pythonStartCommand = @"
cd '$pythonBackendPath'
Write-Host 'Iniciando Backend Python (sin venv)...' -ForegroundColor Cyan
python main.py
"@
        }
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $pythonStartCommand
        Start-Sleep -Seconds 5
        
        if (Test-Port -Port 8000) {
            Write-Status "success" "Backend Python iniciado en http://localhost:8000"
            Write-Status "info" "Documentación API: http://localhost:8000/docs"
        } else {
            Write-Status "warning" "Backend Python puede estar iniciándose..."
        }
    }
} else {
    Write-Status "error" "No se encontró la carpeta del backend Python"
    Write-Status "info" "Asegúrate de ejecutar este script desde la raíz del proyecto"
}

Write-Host ""

# 5. Iniciar Frontend React
Write-Host "5. Iniciando Frontend React (puerto 5173)..." -ForegroundColor Yellow
Write-Host ""

$frontendPath = ".\nutritrack-frontend"

if (Test-Path $frontendPath) {
    # Verificar si ya está corriendo
    $frontendRunning = Test-Port -Port 5173
    
    if ($frontendRunning) {
        Write-Status "warning" "El puerto 5173 ya está en uso"
        Write-Status "info" "Si es el frontend, ya está corriendo"
    } else {
        Write-Status "info" "Abriendo nueva ventana para Frontend React..."
        
        $frontendStartCommand = @"
cd '$frontendPath'
Write-Host 'Iniciando Frontend React...' -ForegroundColor Cyan
npm run dev
"@
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendStartCommand
        Start-Sleep -Seconds 5
        
        if (Test-Port -Port 5173) {
            Write-Status "success" "Frontend React iniciado en http://localhost:5173"
        } else {
            Write-Status "warning" "Frontend React puede estar iniciándose..."
        }
    }
} else {
    Write-Status "error" "No se encontró la carpeta del frontend"
    Write-Status "info" "Asegúrate de ejecutar este script desde la raíz del proyecto"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    RESUMEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Servicios iniciados:" -ForegroundColor White
Write-Host "  • MongoDB:         " -NoNewline
if (Test-Port -Port 27017) { Write-Host "✓ http://localhost:27017" -ForegroundColor Green } else { Write-Host "✗ No disponible" -ForegroundColor Red }

Write-Host "  • MySQL:           " -NoNewline
if (Test-Port -Port 3306) { Write-Host "✓ http://localhost:3306" -ForegroundColor Green } else { Write-Host "✗ No disponible" -ForegroundColor Red }

Write-Host "  • Backend Node.js: " -NoNewline
if (Test-Port -Port 3001) { Write-Host "✓ http://localhost:3001" -ForegroundColor Green } else { Write-Host "✗ No disponible" -ForegroundColor Red }

Write-Host "  • Backend Python:  " -NoNewline
if (Test-Port -Port 8000) { Write-Host "✓ http://localhost:8000" -ForegroundColor Green } else { Write-Host "✗ No disponible" -ForegroundColor Red }

Write-Host "  • Frontend React:  " -NoNewline
if (Test-Port -Port 5173) { Write-Host "✓ http://localhost:5173" -ForegroundColor Green } else { Write-Host "✗ No disponible" -ForegroundColor Red }

Write-Host ""
Write-Host "Para acceder a la aplicación:" -ForegroundColor Cyan
Write-Host "  🌐 Abre tu navegador en: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "URLs útiles:" -ForegroundColor Cyan
Write-Host "  📚 API Docs (Swagger): http://localhost:8000/docs" -ForegroundColor White
Write-Host "  🔍 API Health Node:    http://localhost:3001/api/health" -ForegroundColor White
Write-Host "  🔍 API Health Python:  http://localhost:8000/health" -ForegroundColor White
Write-Host ""

Write-Status "info" "Presiona Ctrl+C en cualquier ventana para detener ese servicio"
Write-Host ""

# Esperar a que el usuario presione una tecla
Write-Host "Presiona cualquier tecla para cerrar esta ventana..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
