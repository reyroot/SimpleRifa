<template>
  <div class="admin-payment-methods">
    <div class="header-section">
      <h2 class="app-header-page-title">Gestión de Métodos de Pago</h2>
      <button @click="showCreateModal = true" class="btn-primary">
        <span>➕</span>
        <span>Crear Método</span>
      </button>
    </div>

    <div v-if="loading" class="loading">Cargando métodos de pago...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="paymentMethods.length === 0" class="empty">
      <div class="empty-icon">💳</div>
      <p>No hay métodos de pago configurados</p>
      <button @click="showCreateModal = true" class="btn-primary">Crear primer método</button>
    </div>
    <div v-else class="methods-list">
      <div
        v-for="method in paymentMethods"
        :key="method._id"
        class="method-card"
        :class="{ inactive: !method.isActive }"
      >
        <div class="method-header">
          <div class="method-title-section">
            <span class="method-icon">💳</span>
            <h3>{{ method.name }}</h3>
          </div>
          <span class="status-badge" :class="{ active: method.isActive, inactive: !method.isActive }">
            {{ method.isActive ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
        <div v-if="method.details" class="method-details" v-html="method.details"></div>
        <div v-else class="method-details-empty">
          <span class="empty-text">Sin detalles adicionales</span>
        </div>
        <div class="method-actions">
          <button @click="editMethod(method)" class="btn-edit" title="Editar">
            <span>✏️</span>
            <span>Editar</span>
          </button>
          <button @click="deleteMethod(method._id)" class="btn-delete" title="Eliminar">
            <span>🗑️</span>
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showCreateModal || editingMethod" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingMethod ? 'Editar Método de Pago' : 'Crear Método de Pago' }}</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <form @submit.prevent="saveMethod" class="method-form">
          <div class="form-group">
            <label>Nombre del método *</label>
            <input 
              v-model="formData.name" 
              type="text" 
              required 
              placeholder="Ej: Transferencia Bancaria, PIX, PayPal"
              class="modern-input"
            />
          </div>
          <div class="form-group">
            <label>Detalles / Instrucciones</label>
            <p class="form-hint">Puedes incluir información como CBU, Clave PIX, número de cuenta, etc. Se permite HTML básico.</p>
            <textarea 
              v-model="formData.details" 
              rows="6" 
              placeholder="Ejemplo:&#10;CBU: 1234567890123456789012&#10;Alias: MI.CUENTA.BANCO&#10;Titular: Juan Pérez"
              class="modern-textarea"
            ></textarea>
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                v-model="formData.isActive" 
                type="checkbox" 
                class="modern-checkbox"
              />
              <span>Método activo (visible para los clientes)</span>
            </label>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              <span>Cancelar</span>
            </button>
            <button type="submit" class="btn-primary">
              <span>{{ editingMethod ? 'Actualizar' : 'Crear' }}</span>
              <span class="btn-arrow">→</span>
            </button>
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
  error.value = null;
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
    await fetchPaymentMethods();
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al guardar el método';
    alert(error.value);
  }
}

async function deleteMethod(id) {
  if (confirm('¿Estás seguro de eliminar este método de pago?')) {
    try {
      await api.delete(`/admin/payment-methods/${id}`);
      await fetchPaymentMethods();
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al eliminar el método';
      alert(error.value);
    }
  }
}
</script>

<style scoped>
.admin-payment-methods {
  background: #fff;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.header-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.header-section h2 {
  margin: 0;
  color: #1a1a1a;
  font-size: 1.5rem;
  font-weight: 700;
}

.header-section .btn-primary {
  width: 100%;
}

@media (min-width: 768px) {
  .admin-payment-methods {
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  }
  
  .header-section {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
  }
  
  .header-section h2 {
    font-size: 2rem;
  }
  
  .header-section .btn-primary {
    width: auto;
  }
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color, #007bff), var(--accent-color, #28a745));
  color: #fff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
}

.loading, .error, .empty {
  text-align: center;
  padding: 3rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  margin: 2rem 0;
}

.error {
  color: #dc3545;
  background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
}

.empty p {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.methods-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.method-card {
  background: #fff;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .methods-list {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }
  
  .method-card {
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.method-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color, #007bff);
}

.method-card.inactive {
  opacity: 0.7;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.method-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.method-title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.method-icon {
  font-size: 1.5rem;
}

.method-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 700;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.active {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: #fff;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.status-badge.inactive {
  background: linear-gradient(135deg, #6c757d, #5a6268);
  color: #fff;
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

.method-details {
  color: #666;
  line-height: 1.8;
  font-size: 0.95rem;
  flex: 1;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
}

.method-details-empty {
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  text-align: center;
}

.empty-text {
  color: #999;
  font-style: italic;
  font-size: 0.9rem;
}

.method-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.btn-edit, .btn-delete {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-edit {
  background: linear-gradient(135deg, #ffc107, #ff9800);
  color: #333;
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
}

.btn-delete {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: #fff;
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #fff;
  padding: 0;
  border-radius: 16px;
  width: 95%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

@media (min-width: 768px) {
  .modal-overlay {
    padding: 2rem;
  }
  
  .modal-content {
    border-radius: 20px;
    width: 90%;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 700;
}

@media (min-width: 768px) {
  .modal-header {
    padding: 2rem;
  }
  
  .modal-header h3 {
    font-size: 1.75rem;
  }
}

.modal-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #dc3545;
  color: #fff;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #c82333;
  transform: scale(1.1);
}

.method-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
}

@media (min-width: 768px) {
  .method-form {
    gap: 1.5rem;
    padding: 2rem;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.form-hint {
  font-size: 0.85rem;
  color: #666;
  margin: -0.5rem 0 0.5rem 0;
  font-style: italic;
}

.modern-input,
.modern-textarea {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.modern-input:focus,
.modern-textarea:focus {
  outline: none;
  border-color: var(--primary-color, #007bff);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.modern-textarea {
  resize: vertical;
  min-height: 120px;
}

.checkbox-group {
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
}

.modern-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--primary-color, #007bff);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.form-actions button {
  width: 100%;
}

@media (min-width: 768px) {
  .form-actions {
    flex-direction: row;
    gap: 1rem;
    justify-content: flex-end;
  }
  
  .form-actions button {
    width: auto;
  }
}

.btn-secondary {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: #6c757d;
  color: #fff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
}

.btn-arrow {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.btn-primary:hover .btn-arrow {
  transform: translateX(4px);
}
</style>
