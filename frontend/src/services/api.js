import axios from 'axios';
import { useAuthStore } from '../store/auth';

const api = axios.create({
  baseURL: '/api',
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

