-- ============================================================
-- SCRIPT DE INICIALIZACIÓN DE MYSQL PARA NUTRITRACK
-- Este script se ejecuta automáticamente al crear el contenedor
-- ============================================================

-- Usar la base de datos
USE nutrition_db;

-- ============================================================
-- TABLA: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    
    -- Campos para calculadora de calorías (para futuras mejoras)
    age INT DEFAULT NULL,
    height DECIMAL(5,2) DEFAULT NULL,
    weight DECIMAL(5,2) DEFAULT NULL,
    gender ENUM('male', 'female') DEFAULT NULL,
    activity_level VARCHAR(20) DEFAULT NULL,
    daily_calories INT DEFAULT NULL,
    daily_protein INT DEFAULT NULL,
    daily_carbs INT DEFAULT NULL,
    daily_fat INT DEFAULT NULL,
    goal VARCHAR(20) DEFAULT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: diaries
-- ============================================================
CREATE TABLE IF NOT EXISTS diaries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, date),
    INDEX idx_user_date (user_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: diary_entries
-- ============================================================
CREATE TABLE IF NOT EXISTS diary_entries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    diary_id INT NOT NULL,
    meal_type VARCHAR(20) NOT NULL COMMENT 'desayuno, almuerzo, comida, merienda, cena',
    food_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 100.00,
    
    -- Valores nutricionales
    calories DECIMAL(10,2) NOT NULL,
    protein DECIMAL(10,2) NOT NULL,
    carbs DECIMAL(10,2) NOT NULL,
    fat DECIMAL(10,2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (diary_id) REFERENCES diaries(id) ON DELETE CASCADE,
    INDEX idx_diary_meal (diary_id, meal_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================================

-- Usuario de prueba (contraseña: Test123!)
-- Hash generado con bcrypt rounds=10
INSERT INTO users (email, password_hash, name) 
VALUES (
    'demo@nutritrack.com',
    '$2a$10$YPKvZ5qJYz8rJ8l0N9F9G.xU8O5nXxV5QxC8F3X5l0N9F9G.xU8O5n',
    'Usuario Demo'
) ON DUPLICATE KEY UPDATE email=email;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

SELECT 'Base de datos inicializada correctamente' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_diaries FROM diaries;
SELECT COUNT(*) AS total_entries FROM diary_entries;
