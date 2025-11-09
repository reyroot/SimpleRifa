import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';
import router from '../router';

export const useAuthStore = defineStore('auth', () => {
  const adminToken = ref(localStorage.getItem('adminToken') || null);

  const hasToken = computed(() => !!adminToken.value);

  function setToken(token) {
    adminToken.value = token;
    localStorage.setItem('adminToken', token);
  }

  function logout() {
    adminToken.value = null;
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  }

  async function login(token) {
    try {
      const response = await api.post('/admin/login', { token });
      if (response.data.token) {
        setToken(response.data.token);
        return { success: true };
      }
      return { success: false, error: 'Token inválido' };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al iniciar sesión' 
      };
    }
  }

  return {
    adminToken,
    hasToken,
    setToken,
    logout,
    login
  };
});

