// verify_system.js - Script de verificación completa del sistema NutriTrack
// Ejecutar con: node verify_system.js

const http = require('http');
const https = require('https');

console.log('='.repeat(60));
console.log('VERIFICACIÓN DEL SISTEMA NUTRITRACK');
console.log('='.repeat(60));
console.log('');

// Colores para la consola
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(status, message) {
    const symbols = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    const colorMap = {
        success: colors.green,
        error: colors.red,
        warning: colors.yellow,
        info: colors.blue
    };
    
    console.log(`${colorMap[status]}${symbols[status]} ${message}${colors.reset}`);
}

// Función para hacer peticiones HTTP
function makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            const jsonData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        }
        
        const req = protocol.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        statusCode: res.statusCode,
                        body: body ? JSON.parse(body) : null,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        body: body,
                        headers: res.headers
                    });
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function checkService(name, url, expectedStatus = 200) {
    try {
        const response = await makeRequest(url);
        if (response.statusCode === expectedStatus) {
            log('success', `${name} está activo y respondiendo (${url})`);
            return true;
        } else {
            log('warning', `${name} respondió con código ${response.statusCode}`);
            return false;
        }
    } catch (error) {
        log('error', `${name} no está accesible: ${error.message}`);
        return false;
    }
}

async function checkNodeBackend() {
    console.log('\n' + '─'.repeat(60));
    console.log('1. BACKEND NODE.JS (Puerto 3001)');
    console.log('─'.repeat(60));
    
    const baseUp = await checkService('Node.js Service', 'http://localhost:3001/api/health');
    
    if (baseUp) {
        // Intentar registrar un usuario de prueba
        try {
            const testUser = {
                email: `test_${Date.now()}@nutritrack.com`,
                password: 'Test123!',
                name: 'Test User'
            };
            
            const response = await makeRequest(
                'http://localhost:3001/api/auth/register',
                'POST',
                testUser
            );
            
            if (response.statusCode === 201 || response.statusCode === 200) {
                log('success', 'Endpoint de registro funciona correctamente');
                
                // Intentar login
                const loginResponse = await makeRequest(
                    'http://localhost:3001/api/auth/login',
                    'POST',
                    {
                        email: testUser.email,
                        password: testUser.password
                    }
                );
                
                if (loginResponse.statusCode === 200 && loginResponse.body.token) {
                    log('success', 'Endpoint de login funciona correctamente');
                    log('info', `Token JWT generado: ${loginResponse.body.token.substring(0, 20)}...`);
                } else {
                    log('error', 'Problema con el login');
                }
            } else if (response.statusCode === 409) {
                log('info', 'El usuario ya existe (esto es normal)');
                
                // Intentar login con credenciales conocidas
                const loginResponse = await makeRequest(
                    'http://localhost:3001/api/auth/login',
                    'POST',
                    {
                        email: 'test@test.com',
                        password: 'test123'
                    }
                );
                
                if (loginResponse.statusCode === 200) {
                    log('success', 'Login funciona con credenciales existentes');
                }
            }
        } catch (error) {
            log('warning', `No se pudo probar el registro/login: ${error.message}`);
        }
    }
    
    return baseUp;
}

async function checkPythonBackend() {
    console.log('\n' + '─'.repeat(60));
    console.log('2. BACKEND PYTHON FASTAPI (Puerto 8000)');
    console.log('─'.repeat(60));
    
    const baseUp = await checkService('Python FastAPI Service', 'http://localhost:8000/health');
    
    if (baseUp) {
        // Verificar endpoint de búsqueda de alimentos
        try {
            const response = await makeRequest('http://localhost:8000/foods?search=apple');
            
            if (response.statusCode === 200) {
                log('success', 'Endpoint de búsqueda de alimentos funciona');
                
                if (Array.isArray(response.body) && response.body.length > 0) {
                    log('info', `Se encontraron ${response.body.length} alimentos en la búsqueda`);
                    log('info', `Ejemplo: ${response.body[0].name || 'Sin nombre'}`);
                } else {
                    log('warning', 'La búsqueda no devolvió resultados (¿base de datos vacía?)');
                }
            }
        } catch (error) {
            log('warning', `No se pudo probar la búsqueda de alimentos: ${error.message}`);
        }
        
        // Verificar documentación OpenAPI
        try {
            const docsResponse = await makeRequest('http://localhost:8000/docs');
            if (docsResponse.statusCode === 200) {
                log('success', 'Documentación OpenAPI disponible en http://localhost:8000/docs');
            }
        } catch (error) {
            log('info', 'Documentación OpenAPI: verificar manualmente');
        }
    }
    
    return baseUp;
}

async function checkFrontend() {
    console.log('\n' + '─'.repeat(60));
    console.log('3. FRONTEND REACT (Puerto 5173)');
    console.log('─'.repeat(60));
    
    return await checkService('Frontend React', 'http://localhost:5173');
}

async function checkDatabases() {
    console.log('\n' + '─'.repeat(60));
    console.log('4. BASES DE DATOS');
    console.log('─'.repeat(60));
    
    // MySQL
    log('info', 'MySQL (Puerto 3306): Verificar manualmente con MySQL Workbench');
    log('info', '  - Base de datos: nutritrack');
    log('info', '  - Tablas esperadas: users');
    
    // MongoDB
    log('info', 'MongoDB (Puerto 27017): Verificar manualmente con MongoDB Compass');
    log('info', '  - Base de datos: nutritrack_foods');
    log('info', '  - Colección esperada: foods');
}

async function checkIntegration() {
    console.log('\n' + '─'.repeat(60));
    console.log('5. PRUEBA DE INTEGRACIÓN COMPLETA');
    console.log('─'.repeat(60));
    
    log('info', 'Flujo a probar manualmente:');
    console.log('  1. Abrir http://localhost:5173');
    console.log('  2. Registrar un nuevo usuario');
    console.log('  3. Hacer login');
    console.log('  4. Buscar un alimento');
    console.log('  5. Añadir alimento al diario');
    console.log('  6. Verificar que los macros se actualizan');
}

// Ejecutar todas las verificaciones
async function runAllChecks() {
    const nodeOk = await checkNodeBackend();
    const pythonOk = await checkPythonBackend();
    const frontendOk = await checkFrontend();
    await checkDatabases();
    await checkIntegration();
    
    console.log('\n' + '='.repeat(60));
    console.log('RESUMEN');
    console.log('='.repeat(60));
    
    const allOk = nodeOk && pythonOk && frontendOk;
    
    if (allOk) {
        log('success', 'Todos los servicios están funcionando correctamente');
        console.log('\n' + colors.green + '¡El sistema está listo para usar!' + colors.reset);
    } else {
        log('warning', 'Algunos servicios necesitan atención');
        console.log('\n' + colors.yellow + 'Servicios que necesitan iniciarse:' + colors.reset);
        if (!nodeOk) console.log('  - Backend Node.js (cd service-node && npm start)');
        if (!pythonOk) console.log('  - Backend Python (cd service-python && python main.py)');
        if (!frontendOk) console.log('  - Frontend React (cd nutritrack-frontend && npm run dev)');
    }
    
    console.log('\n' + colors.blue + 'Para más detalles, revisa los logs de cada servicio.' + colors.reset);
    console.log('');
}

// Ejecutar
runAllChecks().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
});
