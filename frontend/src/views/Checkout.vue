<template>
  <div class="checkout">
    <!-- Confeti container fuera del main para cubrir toda la pantalla -->
    <div v-if="ticketsAssigned && ticketsAssigned.length > 0" class="confetti-container" ref="confettiContainer"></div>
    
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

        <!-- Paso 1: Datos del comprador y método de pago -->
        <div v-if="step === 1" class="step">
          <div class="step-header">
            <span class="step-icon">👤</span>
            <h2>Completar Compra</h2>
          </div>
          
          <!-- Formulario de datos del comprador -->
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
                placeholder="+58 412 1234567"
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
              <small>Precio unitario: {{ currencySymbol }} {{ raffle.pricePerNumber.toLocaleString() }}</small>
            </div>
            <div class="total-modern">
              <span class="total-label">Total</span>
              <span class="total-value">{{ currencySymbol }} {{ totalAmount.toLocaleString() }}</span>
            </div>

            <!-- Selección de método de pago -->
            <div v-if="orderCreated" class="payment-section">
              <div class="section-title">
                <span class="section-icon">💳</span>
                <h3>Selecciona tu método de pago</h3>
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
                </div>
              </div>

              <!-- Instrucciones del método seleccionado -->
              <div v-if="selectedPaymentMethod && selectedMethodDetails" class="payment-instructions">
                <div class="instructions-header">
                  <span class="instructions-icon">📋</span>
                  <h3>Instrucciones de pago</h3>
                </div>
                <div class="instructions-content" v-html="selectedMethodDetails.details"></div>
              </div>
            </div>

            <button v-if="!orderCreated" type="submit" class="btn-primary">
              <span>Continuar</span>
              <span class="btn-arrow">→</span>
            </button>
            <button
              v-else
              type="button"
              @click="handlePaymentComplete"
              :disabled="!selectedPaymentMethod"
              class="btn-primary btn-payment-complete"
            >
              <span>✅ Ya pagué</span>
              <span class="btn-arrow">→</span>
            </button>
          </form>
        </div>

        <!-- Paso 2: Subir comprobante -->
        <div v-if="step === 3" class="step">
          <div class="step-header">
            <span class="step-icon">📤</span>
            <h2>Subir Comprobante de Pago</h2>
          </div>
          
          <div class="warning-box">
            <div class="warning-header">
              <span class="warning-icon">⚠️</span>
              <h3>¡IMPORTANTE!</h3>
            </div>
            <div class="warning-content">
              <p class="warning-text">
                <strong>Si ya realizaste el pago, NO olvides subir el comprobante.</strong>
              </p>
              <p class="warning-details">
                Sin el comprobante de pago, no podremos aprobar tu pedido y <strong>perderás tus números</strong>. 
                Asegúrate de subir una imagen clara del comprobante antes de cerrar esta página.
              </p>
            </div>
          </div>

          <div class="order-info-modern">
            <div class="info-item-modern">
              <span class="info-label-modern">Pedido</span>
              <span class="info-value-modern">#{{ currentOrder?._id?.slice(-8) }}</span>
            </div>
            <div class="info-item-modern">
              <span class="info-label-modern">Total</span>
              <span class="info-value-modern">{{ currencySymbol }} {{ currentOrder?.totalAmount?.toLocaleString() }}</span>
            </div>
            <div v-if="selectedMethodDetails" class="info-item-modern">
              <span class="info-label-modern">Método de pago</span>
              <span class="info-value-modern">{{ selectedMethodDetails.name }}</span>
            </div>
          </div>
          <PaymentUploader
            v-if="!ticketsAssigned"
            :order-id="currentOrder?._id"
            @uploaded="handleUploadComplete"
            @tickets-assigned="handleTicketsAssigned"
          />
          
          <!-- Vista de números asignados con confeti -->
          <div v-if="ticketsAssigned && ticketsAssigned.length > 0" class="tickets-success">
            <div class="success-content">
              <div class="success-icon-large">🎉</div>
              <h2 class="success-title">¡Tus números han sido asignados!</h2>
              <p class="success-message">Estos son tus números para la rifa:</p>
              <div v-if="ticketsAssigned.length > 0" class="tickets-grid">
                <div
                  v-for="(ticket, index) in ticketsAssigned"
                  :key="ticket._id || ticket.numberString || index"
                  class="ticket-number-card"
                >
                  <span class="ticket-number">{{ ticket.numberString || ticket.number || 'N/A' }}</span>
                </div>
              </div>
              <div v-else class="no-tickets">
                <p>No se encontraron números asignados</p>
              </div>
              <p class="success-note">
                <strong>Nota:</strong> Estos números son temporales y se confirmarán una vez que el administrador apruebe tu pago.
              </p>
              <div class="success-actions">
                <router-link to="/my-tickets" class="btn-primary">
                  <span>Ver Mis Tickets</span>
                  <span class="btn-arrow">→</span>
                </router-link>
                <router-link to="/" class="btn-secondary">Volver al Inicio</router-link>
              </div>
            </div>
          </div>
          <div v-if="!ticketsAssigned" class="actions">
            <button @click="step = 1" class="btn-secondary">← Atrás</button>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useRafflesStore } from '../store/raffles';
import { useOrdersStore } from '../store/orders';
import { useConfigStore } from '../store/config';
import PaymentUploader from '../components/PaymentUploader.vue';
import api from '../services/api';

const route = useRoute();
const rafflesStore = useRafflesStore();
const ordersStore = useOrdersStore();
const configStore = useConfigStore();

const currencySymbol = computed(() => {
  return configStore.config.currency === 'VES' ? 'Bs' : '$';
});

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
const orderCreated = ref(false);
const ticketsAssigned = ref(null);
const confettiContainer = ref(null);

const totalAmount = computed(() => {
  if (!raffle.value) return 0;
  return quantity.value * raffle.value.pricePerNumber;
});

const selectedMethodDetails = computed(() => {
  if (!selectedPaymentMethod.value) return null;
  return paymentMethods.value.find(m => m._id === selectedPaymentMethod.value);
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
    orderCreated.value = true;
    // Scroll suave hacia la sección de pago
    setTimeout(() => {
      const paymentSection = document.querySelector('.payment-section');
      if (paymentSection) {
        paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al crear el pedido';
  }
}

function handlePaymentComplete() {
  if (!selectedPaymentMethod.value || !currentOrder.value) return;
  // Redirigir a la vista de subir comprobante
  step.value = 3;
}

async function handleTicketsAssigned(tickets) {
  console.log('Tickets recibidos:', tickets);
  ticketsAssigned.value = tickets;
  // Esperar a que el DOM se actualice antes de iniciar el confeti
  await nextTick();
  setTimeout(() => {
    startConfetti();
  }, 200);
}

function handleUploadComplete() {
  // Ya no necesitamos cambiar de paso, los números se muestran en la misma vista
}

function startConfetti() {
  if (!confettiContainer.value) {
    console.log('Confetti container no encontrado');
    return;
  }
  
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  const confettiCount = 200;
  
  // Limpiar cualquier confeti anterior
  confettiContainer.value.innerHTML = '';
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    
    // Color aleatorio
    const color = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.backgroundColor = color;
    
    // Tamaño aleatorio (pequeños cuadritos)
    const size = Math.random() * 8 + 4; // Entre 4px y 12px
    confetti.style.width = size + 'px';
    confetti.style.height = size + 'px';
    
    // Posición inicial aleatoria dispersa en toda la parte superior
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = Math.random() * 20 - 20 + 'px'; // Disperso desde -20px hasta 0px
    
    // Rotación aleatoria inicial
    const initialRotation = Math.random() * 360;
    
    // Deriva horizontal aleatoria (movimiento lateral)
    const drift = (Math.random() - 0.5) * 2; // Entre -1 y 1
    confetti.style.setProperty('--drift', drift);
    confetti.style.setProperty('--initial-rotation', initialRotation);
    
    // Animación con duración y delay aleatorios
    const duration = Math.random() * 3 + 2; // Entre 2s y 5s
    const delay = Math.random() * 0.5;
    confetti.style.animationDuration = duration + 's';
    confetti.style.animationDelay = delay + 's';
    
    confettiContainer.value.appendChild(confetti);
    
    // Remover después de la animación
    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.remove();
      }
    }, (duration + delay) * 1000);
  }
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
  margin: 1rem auto;
  padding: 0 1rem;
}

.checkout-container {
  padding: 1.5rem;
}

@media (min-width: 768px) {
  .main-content {
    margin: 2rem auto;
  }
  
  .checkout-container {
    padding: 2rem;
  }
}

.checkout-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.checkout-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #1a1a1a;
  flex: 1;
}

@media (min-width: 768px) {
  .checkout-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
  }
  
  .checkout-header h1 {
    font-size: 2rem;
  }
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

.payment-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e9ecef;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  font-size: 1.5rem;
}

.section-title h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
}

.payment-instructions {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #e7f3ff 0%, #d0e7ff 100%);
  border-radius: 12px;
  border: 2px solid var(--primary-color, #007bff);
}

.instructions-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.instructions-icon {
  font-size: 1.5rem;
}

.instructions-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.instructions-content {
  color: #333;
  line-height: 1.8;
  font-size: 0.95rem;
}

.btn-payment-complete {
  margin-top: 1.5rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.actions .btn-primary,
.actions .btn-secondary {
  width: 100%;
}

@media (min-width: 768px) {
  .actions {
    flex-direction: row;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .actions .btn-primary,
  .actions .btn-secondary {
    width: auto;
  }
}

.order-info-modern {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
}

@media (min-width: 768px) {
  .order-info-modern {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    padding: 1.5rem;
  }
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

.tickets-success {
  position: relative;
  min-height: 80vh;
  overflow: visible;
}

.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  border-radius: 2px;
  animation: confettiFall linear forwards;
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) translateX(0) rotate(calc(var(--initial-rotation, 0) * 1deg));
    opacity: 1;
  }
  100% {
    transform: translateY(calc(100vh + 50px)) translateX(calc(var(--drift, 0) * 200px)) rotate(calc(var(--initial-rotation, 0) * 1deg + 720deg));
    opacity: 0;
  }
}

.success-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 3rem 2rem;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  margin: 2rem auto;
  max-width: 800px;
}

.success-icon-large {
  font-size: 5rem;
  margin-bottom: 1rem;
  display: block;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.success-title {
  color: #28a745;
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: 700;
}

.success-message {
  margin-bottom: 2rem;
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
}

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
}

.ticket-number-card {
  background: linear-gradient(135deg, var(--primary-color, #007bff), var(--accent-color, #28a745));
  color: #fff;
  padding: 1.5rem 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  transition: transform 0.3s ease;
  animation: ticketAppear 0.5s ease forwards;
  opacity: 0;
}

.ticket-number-card:nth-child(1) { animation-delay: 0.1s; }
.ticket-number-card:nth-child(2) { animation-delay: 0.2s; }
.ticket-number-card:nth-child(3) { animation-delay: 0.3s; }
.ticket-number-card:nth-child(4) { animation-delay: 0.4s; }
.ticket-number-card:nth-child(5) { animation-delay: 0.5s; }
.ticket-number-card:nth-child(n+6) { animation-delay: 0.6s; }

@keyframes ticketAppear {
  from {
    opacity: 0;
    transform: scale(0.5) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.ticket-number-card:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.4);
}

.ticket-number {
  font-size: 1.5rem;
  font-weight: 700;
  display: block;
}

.success-note {
  margin-bottom: 2rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
  border-radius: 12px;
  color: #856404;
  font-size: 0.95rem;
  line-height: 1.6;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
}

.success-actions .btn-primary,
.success-actions .btn-secondary {
  width: 100%;
}

@media (min-width: 768px) {
  .success-actions {
    flex-direction: row;
    gap: 1rem;
  }
  
  .success-actions .btn-primary,
  .success-actions .btn-secondary {
    width: auto;
  }
  
  .tickets-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .ticket-number {
    font-size: 1.75rem;
  }
}

.warning-box {
  background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
  border: 3px solid #ffc107;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 24px rgba(255, 193, 7, 0.3);
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.warning-icon {
  font-size: 2.5rem;
}

.warning-header h3 {
  margin: 0;
  color: #856404;
  font-size: 1.5rem;
  font-weight: 700;
}

.warning-content {
  color: #856404;
}

.warning-text {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.warning-details {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.warning-steps {
  background: rgba(255, 255, 255, 0.7);
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 1rem;
}

.warning-steps p {
  margin: 0 0 0.75rem 0;
  font-weight: 600;
  color: #856404;
}

.warning-steps ol {
  margin: 0;
  padding-left: 1.5rem;
  line-height: 2;
}

.warning-steps li {
  margin-bottom: 0.5rem;
  color: #856404;
}
</style>

