# 🔍 Kit de Verificación NutriTrack

Este paquete contiene herramientas para verificar que todos los componentes de tu aplicación NutriTrack están funcionando correctamente.

## 📦 Contenido del Paquete

### 1. **GUIA_VERIFICACION.md**
Guía completa paso a paso para verificar cada componente del sistema.

**Cuándo usar**: Cuando quieras verificar manualmente cada servicio y entender qué está pasando.

### 2. **verify_system.js**
Script Node.js que verifica automáticamente todos los servicios HTTP.

**Uso**:
```bash
node verify_system.js
```

**Qué hace**:
- ✓ Verifica que el backend Node.js esté respondiendo
- ✓ Prueba los endpoints de registro y login
- ✓ Verifica que el backend Python esté respondiendo
- ✓ Prueba la búsqueda de alimentos
- ✓ Verifica que el frontend esté accesible

**Requisitos**: Node.js instalado

### 3. **verify_mongodb.py**
Script Python que verifica el estado de MongoDB y la base de datos de alimentos.

**Uso**:
```bash
python verify_mongodb.py
```

**Qué hace**:
- ✓ Verifica conexión a MongoDB
- ✓ Lista todas las bases de datos
- ✓ Muestra estadísticas de la colección de alimentos
- ✓ Muestra ejemplos de documentos
- ✓ Lista categorías y fuentes de datos

**Requisitos**: Python 3 y pymongo instalados (`pip install pymongo`)

### 4. **start_nutritrack.ps1**
Script PowerShell para Windows que inicia todos los servicios automáticamente.

**Uso**:
```powershell
# Si no puedes ejecutar scripts, primero ejecuta:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Luego:
.\start_nutritrack.ps1
```

**Qué hace**:
1. Verifica e inicia MongoDB (si está instalado como servicio)
2. Verifica e inicia MySQL (si está instalado como servicio)
3. Abre una ventana nueva para el backend Node.js
4. Abre una ventana nueva para el backend Python
5. Abre una ventana nueva para el frontend React
6. Muestra un resumen del estado de todos los servicios

**Requisitos**: Windows, PowerShell 5.0 o superior

### 5. **start_nutritrack.sh**
Script Bash para Linux/Mac que inicia todos los servicios automáticamente.

**Uso**:
```bash
# Dale permisos de ejecución
chmod +x start_nutritrack.sh

# Ejecútalo
./start_nutritrack.sh
```

**Qué hace**:
- Igual que el script de PowerShell, pero para sistemas Unix

**Requisitos**: Bash, nc (netcat) para verificar puertos

---

## 🚀 Guía Rápida de Inicio

### Primer uso (Windows):

1. **Extrae todos los archivos** en la raíz de tu proyecto NutriTrack

2. **Inicia los servicios**:
   ```powershell
   .\start_nutritrack.ps1
   ```

3. **Verifica que todo funciona**:
   ```bash
   node verify_system.js
   python verify_mongodb.py
   ```

4. **Abre tu navegador** en: http://localhost:5173

### Primer uso (Linux/Mac):

1. **Extrae todos los archivos** en la raíz de tu proyecto NutriTrack

2. **Dale permisos de ejecución**:
   ```bash
   chmod +x start_nutritrack.sh
   ```

3. **Inicia los servicios**:
   ```bash
   ./start_nutritrack.sh
   ```

4. **Verifica que todo funciona**:
   ```bash
   node verify_system.js
   python verify_mongodb.py
   ```

5. **Abre tu navegador** en: http://localhost:5173

---

## 🔧 Solución de Problemas

### "MongoDB no está corriendo"

**Windows**:
```powershell
net start MongoDB
```

**Linux**:
```bash
sudo systemctl start mongod
```

**Mac**:
```bash
brew services start mongodb-community
```

### "MySQL no está corriendo"

**Windows**:
```powershell
net start MySQL80  # o el nombre de tu servicio
```

**Linux**:
```bash
sudo systemctl start mysql
```

**Mac**:
```bash
brew services start mysql
```

### "No se puede ejecutar el script PowerShell"

Esto significa que las políticas de ejecución están bloqueando los scripts. Solución:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### "Puerto X ya está en uso"

Significa que ya hay un servicio corriendo en ese puerto. Opciones:

1. **Si es tu servicio**: ¡Genial! Ya está corriendo
2. **Si es otro proceso**: 
   - En Windows: `netstat -ano | findstr :PUERTO` → `taskkill /PID XXXX /F`
   - En Linux/Mac: `lsof -i :PUERTO` → `kill -9 PID`

### "La base de datos está vacía"

Si MongoDB no tiene datos, ejecuta los scripts ETL:

```bash
cd service-python  # o nutritrack-food-service
python import_sample_foods.py
python import_from_openfoodfacts.py
```

---

## 📊 Estructura Esperada del Proyecto

Los scripts asumen esta estructura:

```
tu-proyecto/
├── nutritrack-backend/          (o service-node/)
│   ├── server.js
│   ├── package.json
│   └── ...
├── nutritrack-food-service/     (o service-python/)
│   ├── main.py
│   ├── requirements.txt
│   ├── venv/                    (opcional)
│   └── ...
├── nutritrack-frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── verify_system.js             ← Este archivo
├── verify_mongodb.py            ← Este archivo
├── start_nutritrack.ps1         ← Este archivo
├── start_nutritrack.sh          ← Este archivo
└── GUIA_VERIFICACION.md         ← Este archivo
```

Si tus carpetas tienen nombres diferentes, los scripts intentarán encontrarlas automáticamente.

---

## 🎯 Flujo de Trabajo Recomendado

### Desarrollo Diario:

1. **Inicia los servicios**:
   ```powershell
   .\start_nutritrack.ps1
   ```

2. **Trabaja en tu código**

3. **Verifica cambios**:
   - Refresca el navegador para ver cambios en el frontend
   - Los backends se reinician automáticamente si usas nodemon/uvicorn --reload

4. **Al terminar**: Cierra las ventanas de terminal (Ctrl+C)

### Antes de Presentar/Entregar:

1. **Ejecuta verificación completa**:
   ```bash
   node verify_system.js
   python verify_mongodb.py
   ```

2. **Sigue la guía de verificación** para hacer pruebas manuales:
   - Lee `GUIA_VERIFICACION.md`

3. **Prueba el flujo completo**:
   - Registro → Login → Búsqueda → Añadir alimento

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:

1. **Revisa los logs** en las ventanas de terminal de cada servicio
2. **Consulta GUIA_VERIFICACION.md** para diagnóstico detallado
3. **Verifica los puertos**:
   - MongoDB: 27017
   - MySQL: 3306
   - Backend Node: 3001
   - Backend Python: 8000
   - Frontend: 5173

---

## 📝 Notas Adicionales

- **Windows Defender/Firewall**: Puede que te pida permiso la primera vez que inicies los servicios. Acepta.
- **Antivirus**: Algunos antivirus pueden bloquear Node.js o Python. Añade excepciones si es necesario.
- **Recursos**: MongoDB y MySQL pueden consumir bastante memoria. Ciérralos cuando no los uses.
- **Actualizaciones**: Si actualizas las dependencias (npm update, pip install --upgrade), ejecuta los scripts de verificación de nuevo.

---

## ✅ Checklist Final

Antes de dar por terminada la configuración:

- [ ] MongoDB está corriendo y accesible
- [ ] MySQL está corriendo y accesible
- [ ] Backend Node.js responde en puerto 3001
- [ ] Backend Python responde en puerto 8000
- [ ] Frontend carga en puerto 5173
- [ ] Puedes registrar un usuario
- [ ] Puedes hacer login
- [ ] Puedes buscar alimentos
- [ ] Puedes añadir alimentos al diario
- [ ] Los datos persisten después de refrescar

Si todos los ítems están marcados: **¡Felicidades! Tu sistema está funcionando correctamente.** 🎉

---

**Versión**: 1.0  
**Fecha**: Noviembre 2024  
**Proyecto**: NutriTrack - Aplicación de Seguimiento Nutricional
