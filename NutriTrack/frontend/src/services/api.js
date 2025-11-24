import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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

  // 🆕 NUEVO: Obtener perfil completo del usuario
  getProfile: async () => {
    try {
      const response = await api.get('/api/auth/profile');
      return response.data.user;
    } catch (error) {
      console.error('Error en getProfile:', error);
      throw error;
    }
  },

  // 🆕 NUEVO: Actualizar perfil del usuario (calculadora de calorías)
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
