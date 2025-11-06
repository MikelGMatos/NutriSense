#!/bin/bash
# start_nutritrack.sh
# Script para iniciar todos los servicios de NutriTrack en Linux/Mac

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con formato
print_status() {
    case $1 in
        "success")
            echo -e "${GREEN}[✓]${NC} $2"
            ;;
        "error")
            echo -e "${RED}[✗]${NC} $2"
            ;;
        "warning")
            echo -e "${YELLOW}[⚠]${NC} $2"
            ;;
        "info")
            echo -e "${BLUE}[ℹ]${NC} $2"
            ;;
    esac
}

# Función para verificar si un puerto está en uso
check_port() {
    nc -z localhost $1 2>/dev/null
    return $?
}

echo -e "${CYAN}========================================"
echo "    INICIANDO NUTRITRACK"
echo -e "========================================${NC}"
echo ""

# 1. Verificar y iniciar MongoDB
echo -e "${YELLOW}1. Verificando MongoDB...${NC}"
echo ""

if check_port 27017; then
    print_status "success" "MongoDB ya está corriendo en puerto 27017"
else
    print_status "warning" "MongoDB no está corriendo. Intentando iniciar..."
    
    # Intentar iniciar MongoDB
    if command -v systemctl &> /dev/null; then
        # Systemd (Linux)
        sudo systemctl start mongod 2>/dev/null
        sleep 3
        
        if check_port 27017; then
            print_status "success" "MongoDB iniciado exitosamente"
        else
            print_status "error" "No se pudo iniciar MongoDB"
            print_status "info" "Intenta: sudo systemctl start mongod"
        fi
    elif command -v brew &> /dev/null; then
        # macOS con Homebrew
        brew services start mongodb-community 2>/dev/null
        sleep 3
        
        if check_port 27017; then
            print_status "success" "MongoDB iniciado exitosamente"
        else
            print_status "error" "No se pudo iniciar MongoDB"
            print_status "info" "Intenta: brew services start mongodb-community"
        fi
    else
        print_status "error" "No se pudo determinar cómo iniciar MongoDB"
        print_status "info" "Inicia MongoDB manualmente"
    fi
fi

echo ""

# 2. Verificar MySQL
echo -e "${YELLOW}2. Verificando MySQL...${NC}"
echo ""

if check_port 3306; then
    print_status "success" "MySQL ya está corriendo en puerto 3306"
else
    print_status "warning" "MySQL no está corriendo. Intentando iniciar..."
    
    if command -v systemctl &> /dev/null; then
        # Systemd (Linux)
        sudo systemctl start mysql 2>/dev/null || sudo systemctl start mysqld 2>/dev/null
        sleep 3
        
        if check_port 3306; then
            print_status "success" "MySQL iniciado exitosamente"
        else
            print_status "error" "No se pudo iniciar MySQL"
        fi
    elif command -v brew &> /dev/null; then
        # macOS con Homebrew
        brew services start mysql 2>/dev/null
        sleep 3
        
        if check_port 3306; then
            print_status "success" "MySQL iniciado exitosamente"
        else
            print_status "error" "No se pudo iniciar MySQL"
        fi
    else
        print_status "error" "No se pudo determinar cómo iniciar MySQL"
    fi
fi

echo ""

# 3. Iniciar Backend Node.js
echo -e "${YELLOW}3. Iniciando Backend Node.js (puerto 3001)...${NC}"
echo ""

NODE_BACKEND_PATH="./nutritrack-backend"
if [ ! -d "$NODE_BACKEND_PATH" ]; then
    NODE_BACKEND_PATH="./service-node"
fi

if [ -d "$NODE_BACKEND_PATH" ]; then
    if check_port 3001; then
        print_status "warning" "El puerto 3001 ya está en uso"
        print_status "info" "Si es el backend Node.js, ya está corriendo"
    else
        print_status "info" "Iniciando Backend Node.js en una nueva terminal..."
        
        # Detectar el emulador de terminal
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash -c "cd $NODE_BACKEND_PATH && echo 'Iniciando Backend Node.js...' && npm start; exec bash"
        elif command -v xterm &> /dev/null; then
            xterm -e "cd $NODE_BACKEND_PATH && echo 'Iniciando Backend Node.js...' && npm start; exec bash" &
        elif command -v osascript &> /dev/null; then
            # macOS
            osascript -e "tell app \"Terminal\" to do script \"cd $(pwd)/$NODE_BACKEND_PATH && npm start\""
        else
            # Sin terminal gráfica, ejecutar en background
            (cd $NODE_BACKEND_PATH && npm start > node-backend.log 2>&1 &)
            print_status "info" "Backend ejecutándose en background. Log: node-backend.log"
        fi
        
        sleep 5
        
        if check_port 3001; then
            print_status "success" "Backend Node.js iniciado en http://localhost:3001"
        else
            print_status "warning" "Backend Node.js puede estar iniciándose..."
        fi
    fi
else
    print_status "error" "No se encontró la carpeta del backend Node.js"
fi

echo ""

# 4. Iniciar Backend Python
echo -e "${YELLOW}4. Iniciando Backend Python FastAPI (puerto 8000)...${NC}"
echo ""

PYTHON_BACKEND_PATH="./nutritrack-food-service"
if [ ! -d "$PYTHON_BACKEND_PATH" ]; then
    PYTHON_BACKEND_PATH="./service-python"
fi

if [ -d "$PYTHON_BACKEND_PATH" ]; then
    if check_port 8000; then
        print_status "warning" "El puerto 8000 ya está en uso"
        print_status "info" "Si es el backend Python, ya está corriendo"
    else
        print_status "info" "Iniciando Backend Python en una nueva terminal..."
        
        # Verificar si existe entorno virtual
        VENV_PATH="$PYTHON_BACKEND_PATH/venv/bin/activate"
        
        if [ -f "$VENV_PATH" ]; then
            START_CMD="source venv/bin/activate && python main.py"
        else
            START_CMD="python main.py"
        fi
        
        # Detectar el emulador de terminal
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash -c "cd $PYTHON_BACKEND_PATH && echo 'Iniciando Backend Python...' && $START_CMD; exec bash"
        elif command -v xterm &> /dev/null; then
            xterm -e "cd $PYTHON_BACKEND_PATH && echo 'Iniciando Backend Python...' && $START_CMD; exec bash" &
        elif command -v osascript &> /dev/null; then
            # macOS
            osascript -e "tell app \"Terminal\" to do script \"cd $(pwd)/$PYTHON_BACKEND_PATH && $START_CMD\""
        else
            # Sin terminal gráfica, ejecutar en background
            (cd $PYTHON_BACKEND_PATH && eval $START_CMD > python-backend.log 2>&1 &)
            print_status "info" "Backend ejecutándose en background. Log: python-backend.log"
        fi
        
        sleep 5
        
        if check_port 8000; then
            print_status "success" "Backend Python iniciado en http://localhost:8000"
            print_status "info" "Documentación API: http://localhost:8000/docs"
        else
            print_status "warning" "Backend Python puede estar iniciándose..."
        fi
    fi
else
    print_status "error" "No se encontró la carpeta del backend Python"
fi

echo ""

# 5. Iniciar Frontend React
echo -e "${YELLOW}5. Iniciando Frontend React (puerto 5173)...${NC}"
echo ""

FRONTEND_PATH="./nutritrack-frontend"

if [ -d "$FRONTEND_PATH" ]; then
    if check_port 5173; then
        print_status "warning" "El puerto 5173 ya está en uso"
        print_status "info" "Si es el frontend, ya está corriendo"
    else
        print_status "info" "Iniciando Frontend React en una nueva terminal..."
        
        # Detectar el emulador de terminal
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash -c "cd $FRONTEND_PATH && echo 'Iniciando Frontend React...' && npm run dev; exec bash"
        elif command -v xterm &> /dev/null; then
            xterm -e "cd $FRONTEND_PATH && echo 'Iniciando Frontend React...' && npm run dev; exec bash" &
        elif command -v osascript &> /dev/null; then
            # macOS
            osascript -e "tell app \"Terminal\" to do script \"cd $(pwd)/$FRONTEND_PATH && npm run dev\""
        else
            # Sin terminal gráfica, ejecutar en background
            (cd $FRONTEND_PATH && npm run dev > frontend.log 2>&1 &)
            print_status "info" "Frontend ejecutándose en background. Log: frontend.log"
        fi
        
        sleep 5
        
        if check_port 5173; then
            print_status "success" "Frontend React iniciado en http://localhost:5173"
        else
            print_status "warning" "Frontend React puede estar iniciándose..."
        fi
    fi
else
    print_status "error" "No se encontró la carpeta del frontend"
fi

echo ""
echo -e "${CYAN}========================================"
echo "    RESUMEN"
echo -e "========================================${NC}"
echo ""

echo -e "${NC}Servicios iniciados:${NC}"

echo -n "  • MongoDB:         "
if check_port 27017; then
    echo -e "${GREEN}✓ http://localhost:27017${NC}"
else
    echo -e "${RED}✗ No disponible${NC}"
fi

echo -n "  • MySQL:           "
if check_port 3306; then
    echo -e "${GREEN}✓ http://localhost:3306${NC}"
else
    echo -e "${RED}✗ No disponible${NC}"
fi

echo -n "  • Backend Node.js: "
if check_port 3001; then
    echo -e "${GREEN}✓ http://localhost:3001${NC}"
else
    echo -e "${RED}✗ No disponible${NC}"
fi

echo -n "  • Backend Python:  "
if check_port 8000; then
    echo -e "${GREEN}✓ http://localhost:8000${NC}"
else
    echo -e "${RED}✗ No disponible${NC}"
fi

echo -n "  • Frontend React:  "
if check_port 5173; then
    echo -e "${GREEN}✓ http://localhost:5173${NC}"
else
    echo -e "${RED}✗ No disponible${NC}"
fi

echo ""
echo -e "${CYAN}Para acceder a la aplicación:${NC}"
echo -e "  🌐 Abre tu navegador en: ${NC}http://localhost:5173${NC}"
echo ""
echo -e "${CYAN}URLs útiles:${NC}"
echo -e "  📚 API Docs (Swagger): ${NC}http://localhost:8000/docs${NC}"
echo -e "  🔍 API Health Node:    ${NC}http://localhost:3001/api/health${NC}"
echo -e "  🔍 API Health Python:  ${NC}http://localhost:8000/health${NC}"
echo ""

print_status "info" "Para detener los servicios, cierra las ventanas de terminal correspondientes"
echo ""
