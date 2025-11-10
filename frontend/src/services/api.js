import axios from 'axios';
import { useAuthStore } from '../store/auth';

// Usar variable de entorno para la URL del backend, o '/api' como fallback para desarrollo
// En Vite, las variables de entorno se inyectan en tiempo de BUILD
// Asegúrate de configurar VITE_API_BASE_URL en Vercel antes del build
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Si la variable está definida y no está vacía, usarla
  if (envUrl && envUrl.trim() !== '') {
    // Asegurar que no termine con /api si ya lo tiene
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  
  // Fallback: usar ruta relativa (funciona con proxy en desarrollo o si el backend está en el mismo dominio)
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// Log para debugging (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
  console.log('Environment variables:', {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    MODE: import.meta.env.MODE
  });
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir token de admin en todas las peticiones
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.adminToken) {
    config.headers.Authorization = `Bearer ${authStore.adminToken}`;
  }
  
  // Si es FormData, NO establecer Content-Type (axios lo hará automáticamente con el boundary)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      const authStore = useAuthStore();
      authStore.logout();
    }
    return Promise.reject(error);
  }
);

export default api;

