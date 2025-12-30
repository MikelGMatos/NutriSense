import axios from 'axios';

// ⭐ AHORA TODO VA A TRAVÉS DEL API GATEWAY
const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:4000';

console.log('🌐 API_URL configurada:', API_URL);

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos timeout
});

// Interceptor para añadir el token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
    });
    
    // Si el token expiró, redirigir al login
    if (error.response?.status === 401) {
      console.warn('🔒 Token expirado o inválido');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  register: async (email, password, name) => {
    const response = await api.post('/api/auth/register', {
      email,
      password,
      name,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtener perfil completo del usuario
  getProfile: async () => {
    try {
      const response = await api.get('/api/auth/profile');
      return response.data.user;
    } catch (error) {
      console.error('Error en getProfile:', error);
      throw error;
    }
  },

  // Actualizar perfil del usuario (calculadora de calorías)
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/api/auth/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error en updateProfile:', error);
      throw error;
    }
  },
};

// Servicios de diarios
export const diaryService = {
  getDiary: async (date) => {
    const response = await api.get(`/api/diaries/${date}`);
    return response.data;
  },

  addEntry: async (date, entryData) => {
    const response = await api.post(`/api/diaries/${date}/entries`, entryData);
    return response.data;
  },

  deleteEntry: async (entryId) => {
    const response = await api.delete(`/api/diaries/entries/${entryId}`);
    return response.data;
  },
};

export default api;
