import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useConfigStore = defineStore('config', () => {
  const config = ref({
    platformName: 'Sistema de Rifas',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    accentColor: '#28a745',
    backgroundColor: '#f5f5f5',
    textColor: '#333333',
    logoUrl: '',
    faviconUrl: '',
    contactEmail: '',
    contactPhone: '',
    footerText: '© 2024 Sistema de Rifas. Todos los derechos reservados.'
  });
  const loading = ref(false);
  const error = ref(null);

  async function fetchConfig() {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/config');
      config.value = response.data;
      applyConfig();
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al cargar configuración';
    } finally {
      loading.value = false;
    }
  }

  async function updateConfig(configData) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.put('/admin/config', configData);
      config.value = response.data;
      applyConfig();
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Error al actualizar configuración';
      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  }

  function applyConfig() {
    // Aplicar colores CSS personalizados
    const root = document.documentElement;
    root.style.setProperty('--primary-color', config.value.primaryColor);
    root.style.setProperty('--secondary-color', config.value.secondaryColor);
    root.style.setProperty('--accent-color', config.value.accentColor);
    root.style.setProperty('--background-color', config.value.backgroundColor);
    root.style.setProperty('--text-color', config.value.textColor);

    // Actualizar título de la página
    document.title = config.value.platformName;

    // Actualizar favicon si existe
    if (config.value.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = config.value.faviconUrl;
    }
  }

  return {
    config,
    loading,
    error,
    fetchConfig,
    updateConfig,
    applyConfig
  };
});

