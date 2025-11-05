const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
```

---

## 📄 **ACTUALIZAR .gitignore PRINCIPAL**

### **10. `NUTRISENSE/.gitignore` (en la raíz)**

Actualiza tu `.gitignore` principal con esto:
```
# Frontend
frontend/node_modules/
frontend/dist/
frontend/.env
frontend/.env.local

# Backend Node.js
backend/service-node/node_modules/
backend/service-node/.env

# Backend Python (futuro)
backend/service-python/venv/
backend/service-python/__pycache__/
backend/service-python/.env

# General
.DS_Store
*.log
.vscode/
.idea/

# Old files
/node_modules/