# GUÍA DE VERIFICACIÓN DEL SISTEMA NUTRITRACK

Esta guía te ayudará a verificar que todos los componentes de NutriTrack están funcionando correctamente.

## REQUISITOS PREVIOS

Antes de comenzar, asegúrate de tener instalado:
- Node.js (v16 o superior)
- Python (v3.8 o superior)
- MySQL (corriendo en puerto 3306)
- MongoDB (corriendo en puerto 27017)

---

## PASO 1: VERIFICAR MONGODB

### En Windows:

1. **Iniciar MongoDB** (si no está corriendo):
   ```powershell
   # Como servicio
   net start MongoDB
   
   # O manualmente
   cd "C:\Program Files\MongoDB\Server\[version]\bin"
   mongod --dbpath "C:\data\db"
   ```

2. **Verificar con el script Python**:
   ```bash
   python verify_mongodb.py
   ```

   Deberías ver:
   - ✓ MongoDB está corriendo y accesible
   - Lista de bases de datos
   - Estado de la colección "foods"

3. **Verificar con MongoDB Compass** (opcional):
   - Abre MongoDB Compass
   - Conecta a: `mongodb://localhost:27017`
   - Busca la base de datos: `nutritrack_foods`
   - Verifica la colección: `foods`

### ¿Qué hacer si falla?

**Error: "Connection refused"**
- MongoDB no está corriendo
- Solución: Iniciar MongoDB con uno de los comandos anteriores

**Error: "Base de datos vacía"**
- MongoDB está corriendo pero no hay datos
- Solución: Ejecutar los scripts ETL (ver Paso 5)

---

## PASO 2: VERIFICAR MYSQL

### En Windows:

1. **Verificar que MySQL está corriendo**:
   ```powershell
   # Verificar el servicio
   Get-Service MySQL* | Select-Object Name, Status
   
   # O iniciar el servicio
   net start MySQL80  # o el nombre de tu servicio MySQL
   ```

2. **Verificar con MySQL Workbench**:
   - Abre MySQL Workbench
   - Conecta a: `localhost:3306`
   - Usuario: `root` (o tu usuario)
   - Busca la base de datos: `nutritrack`
   - Verifica las tablas: `users`

3. **Verificar desde línea de comandos** (opcional):
   ```bash
   mysql -u root -p
   ```
   
   Luego en MySQL:
   ```sql
   SHOW DATABASES;
   USE nutritrack;
   SHOW TABLES;
   SELECT COUNT(*) FROM users;
   ```

### ¿Qué hacer si falla?

**Error: "Can't connect to MySQL server"**
- MySQL no está corriendo
- Solución: `net start MySQL80`

**Error: "Database doesn't exist"**
- La base de datos no se ha creado
- Solución: Verificar que el backend Node.js la creó al iniciar

---

## PASO 3: VERIFICAR BACKEND NODE.JS (Puerto 3001)

1. **Navegar a la carpeta del servicio**:
   ```bash
   cd nutritrack-backend
   # o
   cd service-node
   ```

2. **Iniciar el servicio**:
   ```bash
   npm start
   ```

   Deberías ver:
   ```
   ✓ Conexión a MySQL exitosa
   🚀 Servidor corriendo en puerto 3001
   ```

3. **Verificar endpoints** (en otra terminal o navegador):
   ```bash
   # Health check
   curl http://localhost:3001/api/health
   # Debería devolver: {"status":"ok"}
   ```

4. **Probar registro de usuario**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d "{\"email\":\"test@test.com\",\"password\":\"test123\",\"name\":\"Test User\"}"
   ```

5. **Probar login**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d "{\"email\":\"test@test.com\",\"password\":\"test123\"}"
   ```

### ¿Qué hacer si falla?

**Error: "Cannot connect to MySQL"**
- Verificar que MySQL está corriendo (Paso 2)
- Verificar las credenciales en el archivo `.env`

**Error: "Port 3001 already in use"**
- Otro proceso está usando el puerto
- Solución: Cambiar el puerto en `.env` o cerrar el otro proceso

---

## PASO 4: VERIFICAR BACKEND PYTHON (Puerto 8000)

1. **Navegar a la carpeta del servicio**:
   ```bash
   cd nutritrack-food-service
   # o
   cd service-python
   ```

2. **Activar entorno virtual** (si usas uno):
   ```bash
   # Windows
   .\venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Iniciar el servicio**:
   ```bash
   python main.py
   # o
   uvicorn main:app --reload --port 8000
   ```

   Deberías ver:
   ```
   INFO:     Started server process
   INFO:     Uvicorn running on http://127.0.0.1:8000
   ```

4. **Verificar endpoints**:
   ```bash
   # Health check
   curl http://localhost:8000/health
   
   # Listar alimentos
   curl http://localhost:8000/foods
   
   # Buscar alimentos
   curl "http://localhost:8000/foods?search=apple"
   ```

5. **Ver documentación OpenAPI**:
   - Abre el navegador: http://localhost:8000/docs
   - Deberías ver la interfaz Swagger UI con todos los endpoints

### ¿Qué hacer si falla?

**Error: "Cannot connect to MongoDB"**
- Verificar que MongoDB está corriendo (Paso 1)
- Verificar la URI de conexión en el código

**Error: "Port 8000 already in use"**
- Cambiar el puerto: `uvicorn main:app --port 8001`

---

## PASO 5: IMPORTAR DATOS (Si la BD está vacía)

Si MongoDB no tiene datos, ejecuta los scripts ETL:

1. **Importar datos de ejemplo**:
   ```bash
   cd service-python
   python import_sample_foods.py
   ```

   Debería importar ~20 alimentos de ejemplo

2. **Importar desde Open Food Facts** (opcional):
   ```bash
   python import_from_openfoodfacts.py
   ```

   Esto puede tardar varios minutos, importará alimentos reales

3. **Verificar que se importaron**:
   ```bash
   python verify_mongodb.py
   ```

---

## PASO 6: VERIFICAR FRONTEND (Puerto 5173)

1. **Navegar a la carpeta del frontend**:
   ```bash
   cd nutritrack-frontend
   ```

2. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

   Deberías ver:
   ```
   VITE v4.x.x  ready in xxx ms
   ➜  Local:   http://localhost:5173/
   ```

3. **Abrir el navegador**:
   - Ve a: http://localhost:5173
   - Deberías ver la página de login

---

## PASO 7: PRUEBA DE INTEGRACIÓN COMPLETA

Ahora que todos los servicios están corriendo, prueba el flujo completo:

### 7.1 Registro de Usuario

1. Abre http://localhost:5173
2. Ve a la página de registro
3. Crea una cuenta:
   - Email: tu-email@ejemplo.com
   - Contraseña: (tu contraseña)
4. Deberías ser redirigido al dashboard

### 7.2 Búsqueda de Alimentos

1. En el dashboard, busca un alimento (ej: "apple", "chicken")
2. Deberías ver resultados de la base de datos MongoDB
3. Los resultados deben mostrar:
   - Nombre del alimento
   - Calorías
   - Macronutrientes (proteínas, carbohidratos, grasas)

### 7.3 Añadir Alimento al Diario

1. Selecciona un alimento de los resultados
2. Elige la porción (ej: 100g, 1 serving)
3. Selecciona la comida (desayuno, almuerzo, cena, etc.)
4. Haz clic en "Añadir"
5. Verifica que:
   - El alimento aparece en la lista de la comida seleccionada
   - Los macros totales del día se actualizan
   - Las barras de progreso se actualizan

### 7.4 Verificar Persistencia

1. Actualiza la página (F5)
2. Verifica que tus datos siguen ahí
3. Cierra sesión y vuelve a iniciar sesión
4. Verifica que tus datos siguen ahí

---

## PASO 8: VERIFICACIÓN AUTOMATIZADA

Puedes usar el script de verificación automática:

```bash
node verify_system.js
```

Este script verificará automáticamente:
- ✓ Backend Node.js está respondiendo
- ✓ Backend Python está respondiendo
- ✓ Frontend está accesible
- ✓ Endpoints de autenticación funcionan
- ✓ Endpoints de búsqueda de alimentos funcionan

---

## CHECKLIST FINAL

Marca cada ítem cuando esté verificado:

### Servicios Base
- [ ] MongoDB está corriendo y accesible
- [ ] MySQL está corriendo y accesible
- [ ] Base de datos `nutritrack` existe en MySQL
- [ ] Base de datos `nutritrack_foods` existe en MongoDB
- [ ] Colección `foods` tiene datos

### Backend Node.js (Puerto 3001)
- [ ] Servicio está corriendo
- [ ] Health check responde OK
- [ ] Registro de usuarios funciona
- [ ] Login funciona y devuelve JWT
- [ ] Conexión a MySQL exitosa

### Backend Python (Puerto 8000)
- [ ] Servicio está corriendo
- [ ] Health check responde OK
- [ ] Búsqueda de alimentos funciona
- [ ] Documentación OpenAPI accesible
- [ ] Conexión a MongoDB exitosa

### Frontend (Puerto 5173)
- [ ] Aplicación carga en el navegador
- [ ] Página de login se muestra correctamente
- [ ] Página de registro funciona
- [ ] Dashboard se muestra después de login
- [ ] Formulario de búsqueda funciona

### Integración
- [ ] Frontend puede comunicarse con backend Node.js
- [ ] Frontend puede comunicarse con backend Python
- [ ] Datos persisten después de refresh
- [ ] Logout funciona correctamente

---

## PROBLEMAS COMUNES Y SOLUCIONES

### "CORS error" en el navegador

**Problema**: El frontend no puede comunicarse con el backend.

**Solución**:
1. Verifica que el backend Node.js tenga CORS habilitado:
   ```javascript
   app.use(cors({
     origin: 'http://localhost:5173',
     credentials: true
   }));
   ```

2. Verifica que el backend Python tenga CORS habilitado:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

### "Network error" al hacer requests

**Problema**: El frontend no puede conectarse a los backends.

**Soluciones**:
1. Verifica que todos los servicios estén corriendo
2. Verifica los puertos en los archivos de configuración
3. Revisa la consola del navegador para ver el error exacto
4. Verifica que no haya firewall bloqueando los puertos

### "Authentication failed" siempre

**Problema**: El login falla incluso con credenciales correctas.

**Soluciones**:
1. Verifica que el JWT_SECRET esté configurado en el backend
2. Verifica que el frontend esté enviando las credenciales correctamente
3. Revisa los logs del backend Node.js
4. Intenta registrar un nuevo usuario y hacer login con él

### MongoDB vacío después de importar

**Problema**: Los scripts ETL se ejecutan pero no hay datos.

**Soluciones**:
1. Verifica los logs del script para ver si hubo errores
2. Verifica la conexión a MongoDB con `python verify_mongodb.py`
3. Ejecuta `import_sample_foods.py` primero (es más pequeño y confiable)
4. Verifica con MongoDB Compass que los datos realmente no estén ahí

---

## LOGS Y DEBUGGING

### Dónde buscar información cuando algo falla:

1. **Backend Node.js**: 
   - Logs en la terminal donde ejecutaste `npm start`
   - Busca mensajes de error en rojo

2. **Backend Python**:
   - Logs en la terminal donde ejecutaste `python main.py`
   - Busca stack traces y excepciones

3. **Frontend**:
   - Consola del navegador (F12 → Console)
   - Network tab para ver requests fallidos (F12 → Network)

4. **MongoDB**:
   - Logs en la terminal donde ejecutaste `mongod`
   - O en: `C:\Program Files\MongoDB\Server\[version]\log\mongod.log`

5. **MySQL**:
   - MySQL Workbench → Server → Server Status
   - O archivos de log en la carpeta de instalación de MySQL

---

## SIGUIENTE PASO

Una vez que todo esté verificado y funcionando:

1. **Documenta tu configuración**: Anota cualquier cambio que hayas hecho
2. **Haz backup de la base de datos**: Especialmente si has importado muchos datos
3. **Crea un script de inicio**: Para arrancar todos los servicios de una vez
4. **Considera usar Docker**: Para facilitar el despliegue en el futuro

---

## NECESITAS AYUDA?

Si algo no funciona después de seguir esta guía:

1. Revisa los logs específicos del servicio que falla
2. Copia el mensaje de error completo
3. Verifica que todos los prerequisitos estén instalados
4. Comprueba que no haya conflictos de puertos

¡Buena suerte con tu proyecto NutriTrack! 🚀
