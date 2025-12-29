const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NutriTrack Auth & Diary Service API',
      version: '1.0.0',
      description: `
# 🔐 API de Autenticación y Diarios

Esta API proporciona funcionalidades de autenticación de usuarios y gestión de diarios alimentarios para NutriTrack.

## Características principales:

### 🔑 Autenticación
* **Registro de usuarios** - Crear nuevas cuentas
* **Login** - Autenticación con JWT
* **Perfil de usuario** - Consultar y actualizar datos personales
* **Cálculo de calorías** - Usando la fórmula de Harris-Benedict

### 📔 Gestión de Diarios
* **Crear entradas** - Añadir alimentos consumidos
* **Consultar diario** - Ver entradas por fecha
* **Actualizar entradas** - Modificar cantidades y macros
* **Eliminar entradas** - Borrar registros

## Tecnologías:
* Node.js + Express para la API REST
* MySQL para almacenamiento de datos
* JWT para autenticación segura
* bcryptjs para encriptación de contraseñas

## Base de datos:
* **MySQL** - Almacenamiento relacional
* **Tablas**: users, diaries, diary_entries
* **Relaciones**: 1:N entre users-diaries y diaries-diary_entries

## Seguridad:
* Todas las rutas de diario requieren autenticación JWT
* Las contraseñas se almacenan hasheadas con bcrypt
* Cada usuario solo puede acceder a sus propios datos
      `,
      contact: {
        name: 'NutriTrack Team',
        email: 'info@nutritrack.com',
      },
      license: {
        name: 'MIT License',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desarrollo',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints de autenticación y gestión de usuarios',
      },
      {
        name: 'Diary',
        description: 'Endpoints de gestión de diarios alimentarios',
      },
      {
        name: 'Health',
        description: 'Endpoints de monitoreo del servicio',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint /api/auth/login',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario',
              example: 1,
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'usuario@example.com',
            },
            name: {
              type: 'string',
              description: 'Nombre del usuario',
              example: 'Juan Pérez',
            },
            age: {
              type: 'integer',
              description: 'Edad del usuario',
              example: 30,
            },
            weight: {
              type: 'number',
              format: 'float',
              description: 'Peso en kilogramos',
              example: 75.5,
            },
            height: {
              type: 'number',
              format: 'float',
              description: 'Altura en centímetros',
              example: 175,
            },
            gender: {
              type: 'string',
              enum: ['male', 'female'],
              description: 'Género del usuario',
              example: 'male',
            },
            activity_level: {
              type: 'string',
              enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
              description: 'Nivel de actividad física',
              example: 'moderate',
            },
            goal: {
              type: 'string',
              enum: ['lose', 'maintain', 'gain'],
              description: 'Objetivo nutricional',
              example: 'maintain',
            },
            daily_calories: {
              type: 'integer',
              description: 'Calorías diarias calculadas',
              example: 2200,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de registro',
            },
          },
        },
        DiaryEntry: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la entrada',
              example: 1,
            },
            diary_id: {
              type: 'integer',
              description: 'ID del diario al que pertenece',
              example: 5,
            },
            meal_type: {
              type: 'string',
              enum: ['desayuno', 'almuerzo', 'comida', 'merienda', 'cena'],
              description: 'Tipo de comida',
              example: 'desayuno',
            },
            food_name: {
              type: 'string',
              description: 'Nombre del alimento',
              example: 'Pechuga de pollo',
            },
            amount: {
              type: 'number',
              description: 'Cantidad en gramos',
              example: 150,
            },
            calories: {
              type: 'number',
              description: 'Calorías totales',
              example: 247.5,
            },
            protein: {
              type: 'number',
              description: 'Proteínas en gramos',
              example: 46.5,
            },
            carbohydrates: {
              type: 'number',
              description: 'Carbohidratos en gramos',
              example: 0,
            },
            fat: {
              type: 'number',
              description: 'Grasas en gramos',
              example: 5.4,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error',
              example: 'Error al procesar la solicitud',
            },
            details: {
              type: 'string',
              description: 'Detalles adicionales del error',
              example: 'Campo requerido faltante',
            },
          },
        },
      },
    },
  },
  apis: ['./server.js', './src/routes/*.js'], // Archivos con anotaciones JSDoc
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
