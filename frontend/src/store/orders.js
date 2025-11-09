import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([]);
  const currentOrder = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function createOrder(orderData) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post('/orders', orderData);
      currentOrder.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al crear el pedido';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function uploadProof(orderId, file) {
    loading.value = true;
    error.value = null;
    try {
      const formData = new FormData();
      formData.append('proof', file);
      const response = await api.post(`/orders/${orderId}/upload-proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      currentOrder.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al subir el comprobante';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOrders(status = null) {
    loading.value = true;
    error.value = null;
    try {
      const params = status ? { status } : {};
      const response = await api.get('/admin/orders', { params });
      orders.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al cargar pedidos';
    } finally {
      loading.value = false;
    }
  }

  async function approveOrder(orderId) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post(`/admin/orders/${orderId}/approve`);
      const index = orders.value.findIndex(o => o._id === orderId);
      if (index !== -1) {
        orders.value[index] = response.data;
      }
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al aprobar el pedido';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function cancelOrder(orderId) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post(`/admin/orders/${orderId}/cancel`);
      const index = orders.value.findIndex(o => o._id === orderId);
      if (index !== -1) {
        orders.value[index] = response.data;
      }
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al cancelar el pedido';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    orders,
    currentOrder,
    loading,
    error,
    createOrder,
    uploadProof,
    fetchOrders,
    approveOrder,
    cancelOrder
  };
});

