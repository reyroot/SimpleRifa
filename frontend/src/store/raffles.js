import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useRafflesStore = defineStore('raffles', () => {
  const raffles = ref([]);
  const currentRaffle = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function fetchRaffles(status = 'active', useAdminRoute = false) {
    loading.value = true;
    error.value = null;
    try {
      const endpoint = useAdminRoute ? '/admin/raffles' : '/raffles';
      const params = status ? { status } : {};
      const response = await api.get(endpoint, { params });
      raffles.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al cargar rifas';
    } finally {
      loading.value = false;
    }
  }

  async function fetchRaffleById(id) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get(`/raffles/${id}`);
      currentRaffle.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al cargar la rifa';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createRaffle(raffleData) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post('/admin/raffles', raffleData);
      raffles.value.push(response.data);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al crear la rifa';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateRaffle(id, raffleData) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.put(`/admin/raffles/${id}`, raffleData);
      const index = raffles.value.findIndex(r => r._id === id);
      if (index !== -1) {
        raffles.value[index] = response.data;
      }
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al actualizar la rifa';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteRaffle(id) {
    loading.value = true;
    error.value = null;
    try {
      await api.delete(`/admin/raffles/${id}`);
      raffles.value = raffles.value.filter(r => r._id !== id);
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al eliminar la rifa';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function drawRaffle(id) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post(`/admin/raffles/${id}/draw`);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al realizar el sorteo';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function uploadRaffleImages(id, images) {
    loading.value = true;
    error.value = null;
    try {
      const formData = new FormData();
      images.forEach(image => {
        formData.append('images', image);
      });
      
      // NO establecer Content-Type manualmente - axios lo hace automáticamente con el boundary correcto
      // El interceptor ya maneja FormData correctamente
      const response = await api.post(`/admin/raffles/${id}/images`, formData);
      
      // Actualizar la rifa en el store
      const index = raffles.value.findIndex(r => r._id === id);
      if (index !== -1) {
        raffles.value[index].imageUrls = response.data.imageUrls;
      }
      
      if (currentRaffle.value && currentRaffle.value._id === id) {
        currentRaffle.value.imageUrls = response.data.imageUrls;
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al subir imágenes';
      error.value = errorMessage;
      console.error('Error uploading images:', err.response?.data || err);
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  }

  return {
    raffles,
    currentRaffle,
    loading,
    error,
    fetchRaffles,
    fetchRaffleById,
    createRaffle,
    updateRaffle,
    deleteRaffle,
    drawRaffle,
    uploadRaffleImages
  };
});

