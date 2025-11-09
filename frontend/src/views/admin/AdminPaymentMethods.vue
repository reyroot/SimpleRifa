<template>
  <div class="admin-payment-methods">
    <div class="header-section">
      <h2>Gestión de Métodos de Pago</h2>
      <button @click="showCreateModal = true" class="btn-primary">Crear Método</button>
    </div>

    <div v-if="loading" class="loading">Cargando...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="methods-list">
      <div
        v-for="method in paymentMethods"
        :key="method._id"
        class="method-card"
      >
        <div class="method-header">
          <h3>{{ method.name }}</h3>
          <span class="status-badge" :class="{ active: method.isActive, inactive: !method.isActive }">
            {{ method.isActive ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
        <div v-if="method.details" class="method-details" v-html="method.details"></div>
        <div class="method-actions">
          <button @click="editMethod(method)" class="btn-edit">Editar</button>
          <button @click="deleteMethod(method._id)" class="btn-delete">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showCreateModal || editingMethod" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>{{ editingMethod ? 'Editar Método' : 'Crear Método' }}</h3>
        <form @submit.prevent="saveMethod" class="method-form">
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="formData.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Detalles (Instrucciones, CBU, Clave PIX, etc.)</label>
            <textarea v-model="formData.details" rows="5" placeholder="Puedes usar texto plano o HTML básico"></textarea>
          </div>
          <div class="form-group">
            <label>
              <input v-model="formData.isActive" type="checkbox" />
              Activo
            </label>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import api from '../../services/api';

const paymentMethods = ref([]);
const loading = ref(false);
const error = ref(null);
const showCreateModal = ref(false);
const editingMethod = ref(null);
const formData = reactive({
  name: '',
  details: '',
  isActive: true
});

onMounted(() => {
  fetchPaymentMethods();
});

async function fetchPaymentMethods() {
  loading.value = true;
  try {
    const response = await api.get('/admin/payment-methods');
    paymentMethods.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al cargar métodos de pago';
  } finally {
    loading.value = false;
  }
}

function editMethod(method) {
  editingMethod.value = method;
  Object.assign(formData, {
    name: method.name,
    details: method.details || '',
    isActive: method.isActive
  });
}

function closeModal() {
  showCreateModal.value = false;
  editingMethod.value = null;
  Object.assign(formData, {
    name: '',
    details: '',
    isActive: true
  });
}

async function saveMethod() {
  try {
    if (editingMethod.value) {
      await api.put(`/admin/payment-methods/${editingMethod.value._id}`, formData);
    } else {
      await api.post('/admin/payment-methods', formData);
    }
    closeModal();
    fetchPaymentMethods();
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al guardar el método';
  }
}

async function deleteMethod(id) {
  if (confirm('¿Estás seguro de eliminar este método de pago?')) {
    try {
      await api.delete(`/admin/payment-methods/${id}`);
      fetchPaymentMethods();
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al eliminar el método';
    }
  }
}
</script>

<style scoped>
.admin-payment-methods {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.methods-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.method-card {
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
}

.method-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.method-header h3 {
  margin: 0;
  color: #333;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.method-details {
  margin-bottom: 1rem;
  color: #666;
  line-height: 1.6;
}

.method-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary, .btn-secondary, .btn-edit, .btn-delete {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: #007bff;
  color: #fff;
}

.btn-secondary {
  background: #6c757d;
  color: #fff;
}

.btn-edit {
  background: #ffc107;
  color: #333;
}

.btn-delete {
  background: #dc3545;
  color: #fff;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.method-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
}

.form-group input[type="text"],
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>

