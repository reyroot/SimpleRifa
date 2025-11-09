<template>
  <div class="checkout">
    <header class="app-header">
      <div class="app-header-content">
        <router-link to="/" class="app-back-link">← Volver</router-link>
      </div>
    </header>

    <main class="main-content">
      <div v-if="loading" class="loading">Cargando...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="raffle" class="checkout-container modern-card">
        <div class="checkout-header">
          <h1>Comprar Números</h1>
          <span class="raffle-title-badge">{{ raffle.title }}</span>
        </div>

        <!-- Paso 1: Datos del comprador -->
        <div v-if="step === 1" class="step">
          <div class="step-header">
            <span class="step-icon">👤</span>
            <h2>Datos del Comprador</h2>
          </div>
          <form @submit.prevent="handleStep1" class="form">
            <div class="form-group">
              <label>Nombre completo *</label>
              <input
                v-model="buyerInfo.name"
                type="text"
                required
                placeholder="Juan Pérez"
                class="modern-input"
              />
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input
                v-model="buyerInfo.email"
                type="email"
                required
                placeholder="juan@example.com"
                class="modern-input"
              />
            </div>
            <div class="form-group">
              <label>Teléfono *</label>
              <input
                v-model="buyerInfo.phone"
                type="tel"
                required
                placeholder="+54 11 1234-5678"
                class="modern-input"
              />
            </div>
            <div class="form-group">
              <label>Cantidad de números *</label>
              <input
                v-model.number="quantity"
                type="number"
                min="1"
                :max="raffle.maxNumbers"
                required
                class="modern-input"
              />
              <small>Precio unitario: ${{ raffle.pricePerNumber.toLocaleString() }}</small>
            </div>
            <div class="total-modern">
              <span class="total-label">Total</span>
              <span class="total-value">${{ totalAmount.toLocaleString() }}</span>
            </div>
            <button type="submit" class="btn-primary">
              <span>Continuar</span>
              <span class="btn-arrow">→</span>
            </button>
          </form>
        </div>

        <!-- Paso 2: Seleccionar método de pago -->
        <div v-if="step === 2" class="step">
          <div class="step-header">
            <span class="step-icon">💳</span>
            <h2>Seleccionar Método de Pago</h2>
          </div>
          <div v-if="paymentMethodsLoading" class="loading">Cargando métodos de pago...</div>
          <div v-else-if="paymentMethods.length === 0" class="error">
            No hay métodos de pago disponibles
          </div>
          <div v-else class="payment-methods">
            <div
              v-for="method in paymentMethods"
              :key="method._id"
              class="payment-method-modern"
              :class="{ active: selectedPaymentMethod === method._id }"
              @click="selectedPaymentMethod = method._id"
            >
              <div class="payment-method-header">
                <span class="payment-icon">💳</span>
                <h3>{{ method.name }}</h3>
              </div>
              <div v-if="method.details" class="details" v-html="method.details"></div>
            </div>
          </div>
          <div class="actions">
            <button @click="step = 1" class="btn-secondary">← Atrás</button>
            <button
              @click="handleStep2"
              :disabled="!selectedPaymentMethod"
              class="btn-primary"
            >
              <span>Continuar</span>
              <span class="btn-arrow">→</span>
            </button>
          </div>
        </div>

        <!-- Paso 3: Subir comprobante -->
        <div v-if="step === 3" class="step">
          <div class="step-header">
            <span class="step-icon">📤</span>
            <h2>Subir Comprobante de Pago</h2>
          </div>
          <div class="order-info-modern">
            <div class="info-item-modern">
              <span class="info-label-modern">Pedido</span>
              <span class="info-value-modern">#{{ currentOrder?._id?.slice(-8) }}</span>
            </div>
            <div class="info-item-modern">
              <span class="info-label-modern">Total</span>
              <span class="info-value-modern">${{ currentOrder?.totalAmount?.toLocaleString() }}</span>
            </div>
          </div>
          <PaymentUploader
            :order-id="currentOrder?._id"
            @uploaded="handleUploadComplete"
          />
          <div class="actions">
            <button @click="step = 2" class="btn-secondary">← Atrás</button>
          </div>
        </div>

        <!-- Paso 4: Éxito -->
        <div v-if="step === 4" class="step success-modern">
          <div class="success-icon">✅</div>
          <h2>Pedido Creado Exitosamente</h2>
          <p>Tu pago está en revisión. Recibirás un email de confirmación con tus números cuando el administrador apruebe tu pedido.</p>
          <div class="success-actions">
            <router-link to="/my-tickets" class="btn-primary">
              <span>Ver Mis Tickets</span>
              <span class="btn-arrow">→</span>
            </router-link>
            <router-link to="/" class="btn-secondary">Volver al Inicio</router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRafflesStore } from '../store/raffles';
import { useOrdersStore } from '../store/orders';
import PaymentUploader from '../components/PaymentUploader.vue';
import api from '../services/api';

const route = useRoute();
const rafflesStore = useRafflesStore();
const ordersStore = useOrdersStore();

const step = ref(1);
const raffle = ref(null);
const loading = ref(true);
const error = ref(null);
const buyerInfo = ref({
  name: '',
  email: '',
  phone: ''
});
const quantity = ref(1);
const paymentMethods = ref([]);
const paymentMethodsLoading = ref(false);
const selectedPaymentMethod = ref(null);
const currentOrder = ref(null);

const totalAmount = computed(() => {
  if (!raffle.value) return 0;
  return quantity.value * raffle.value.pricePerNumber;
});

onMounted(async () => {
  try {
    raffle.value = await rafflesStore.fetchRaffleById(route.params.raffleId);
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al cargar la rifa';
  } finally {
    loading.value = false;
  }

  await fetchPaymentMethods();
});

async function fetchPaymentMethods() {
  paymentMethodsLoading.value = true;
  try {
    const response = await api.get('/payment-methods');
    paymentMethods.value = response.data;
  } catch (err) {
    error.value = 'Error al cargar métodos de pago';
  } finally {
    paymentMethodsLoading.value = false;
  }
}

async function handleStep1() {
  try {
    const orderData = {
      raffleId: raffle.value._id,
      quantity: quantity.value,
      buyerInfo: buyerInfo.value
    };
    currentOrder.value = await ordersStore.createOrder(orderData);
    step.value = 2;
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al crear el pedido';
  }
}

function handleStep2() {
  if (!selectedPaymentMethod.value) return;
  step.value = 3;
}

function handleUploadComplete() {
  step.value = 4;
}
</script>

<style scoped>
.checkout {
  min-height: 100vh;
  background: #f5f5f5;
}

/* Header styles moved to global styles.css */

.main-content {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.checkout-container {
  padding: 2rem;
}

.checkout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e9ecef;
}

.checkout-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #1a1a1a;
  flex: 1;
}

.raffle-title-badge {
  background: linear-gradient(135deg, var(--primary-color, #007bff), var(--accent-color, #28a745));
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.step-icon {
  font-size: 2rem;
}

.step h2 {
  margin: 0;
  color: #333;
  font-size: 1.75rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.form-group small {
  color: #666;
  font-size: 0.85rem;
  margin-top: -0.5rem;
}

.total-modern {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2px solid var(--primary-color, #007bff);
}

.total-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #666;
}

.total-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color, #007bff);
}

.btn-arrow {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.btn-primary:hover .btn-arrow {
  transform: translateX(4px);
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.payment-method-modern {
  padding: 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.payment-method-modern:hover {
  border-color: var(--primary-color, #007bff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
}

.payment-method-modern.active {
  border-color: var(--primary-color, #007bff);
  background: linear-gradient(135deg, #e7f3ff 0%, #d0e7ff 100%);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
}

.payment-method-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.payment-icon {
  font-size: 1.5rem;
}

.payment-method-modern h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
}

.details {
  color: #666;
  margin-top: 0.5rem;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.order-info-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
}

.info-item-modern {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label-modern {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.info-value-modern {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color, #007bff);
}

.success-modern {
  text-align: center;
  padding: 3rem 2rem;
}

.success-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  display: block;
}

.success-modern h2 {
  color: #28a745;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.success-modern p {
  margin-bottom: 2rem;
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
}

.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}
</style>

