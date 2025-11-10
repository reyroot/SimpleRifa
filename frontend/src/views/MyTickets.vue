<template>
  <div class="my-tickets">
    <header class="app-header">
      <div class="app-header-content">
        <h1 class="app-header-page-title">Mis Tickets</h1>
      </div>
      <nav class="app-header-nav">
        <router-link to="/" class="app-back-link">← Volver al Inicio</router-link>
      </nav>
    </header>

    <main class="main-content">
      <div class="search-section modern-card">
        <div class="search-header">
          <span class="search-icon">🔍</span>
          <h2>Buscar mis números</h2>
        </div>
        <div v-if="!otpSent" class="otp-step">
          <p class="otp-description">Por seguridad, necesitamos verificar tu identidad. Ingresa tu email y te enviaremos un código de verificación.</p>
          <form @submit.prevent="requestOTP" class="search-form">
            <input
              v-model="email"
              type="email"
              placeholder="Ingresa tu email"
              required
              class="modern-input email-input"
            />
            <button type="submit" class="btn-primary" :disabled="loading">
              <span>{{ loading ? 'Enviando...' : 'Enviar Código' }}</span>
              <span v-if="!loading" class="btn-arrow">→</span>
            </button>
          </form>
        </div>
        <div v-else class="otp-verification">
          <div class="otp-card modern-card">
            <div class="otp-card-header">
              <span class="otp-card-icon">🔐</span>
              <div class="otp-card-title-section">
                <h3>Código de Verificación</h3>
                <p class="otp-card-subtitle">Ingresa el código enviado a <strong>{{ email }}</strong></p>
              </div>
            </div>
            <div class="otp-card-body">
              <form @submit.prevent="verifyOTPAndSearch" class="otp-form">
                <div class="otp-input-container">
                  <label for="otp-code" class="otp-label">Código de 6 dígitos</label>
                  <input
                    id="otp-code"
                    v-model="otpCode"
                    type="text"
                    placeholder="000000"
                    required
                    maxlength="6"
                    pattern="[0-9]{6}"
                    class="modern-input otp-input"
                    @input="formatOTPInput"
                  />
                  <p class="otp-hint-text">Revisa tu bandeja de entrada (y spam si no lo encuentras)</p>
                </div>
                <div class="otp-actions">
                  <button type="submit" class="btn-primary" :disabled="loading || otpCode.length !== 6">
                    <span>{{ loading ? 'Verificando...' : 'Verificar y Buscar' }}</span>
                    <span v-if="!loading" class="btn-arrow">→</span>
                  </button>
                  <button type="button" @click="resetOTP" class="btn-secondary">
                    Cambiar Email
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="error">{{ error }}</div>

      <!-- Pedidos Pendientes (mostrar primero) -->
      <div v-if="pendingOrders.length > 0" class="pending-orders-section modern-card">
        <div class="section-header">
          <span class="pending-icon">⏳</span>
          <h2>Pagos Pendientes de Aprobación</h2>
        </div>
        <div class="pending-message">
          <p class="pending-text">
            Tienes <strong>{{ pendingOrders.length }}</strong> pago(s) pendiente(s) de aprobación. 
            Una vez que el administrador apruebe tu pago, recibirás tus números asignados por correo electrónico.
          </p>
        </div>
        <div class="pending-orders-grid">
          <div
            v-for="order in pendingOrders"
            :key="order._id"
            class="pending-order-card"
          >
            <div class="pending-order-header">
              <span class="pending-order-icon">📦</span>
              <div>
                <h3>{{ order.raffle?.title || 'Rifa no disponible' }}</h3>
                <span class="pending-badge">Pendiente</span>
              </div>
            </div>
            <div class="pending-order-details">
              <div class="detail-item">
                <span class="detail-label">Cantidad:</span>
                <span class="detail-value">{{ order.quantity }} números</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Total:</span>
                <span class="detail-value">${{ order.totalAmount.toLocaleString() }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Fecha:</span>
                <span class="detail-value">{{ formatDate(order.createdAt) }}</span>
              </div>
              <div v-if="order.paymentMethod" class="detail-item">
                <span class="detail-label">Método de pago:</span>
                <span class="detail-value">{{ order.paymentMethod.name }}</span>
              </div>
            </div>
            <div class="pending-order-footer">
              <div v-if="order.status === 'pending_payment' && !order.paymentProofUrl" class="upload-proof-section">
                <p class="upload-prompt">Sube tu comprobante de pago:</p>
                <div class="upload-proof-container">
                  <input
                    :ref="`fileInput-${order._id}`"
                    type="file"
                    accept="image/*"
                    @change="(e) => handleFileSelect(e, order._id)"
                    style="display: none"
                    :id="`proof-${order._id}`"
                  />
                  <label :for="`proof-${order._id}`" class="upload-proof-btn">
                    <span>📎 Subir Comprobante</span>
                  </label>
                  <div v-if="uploadingOrders[order._id]" class="uploading-status">
                    <span>Subiendo...</span>
                  </div>
                </div>
              </div>
              <div v-else-if="order.status === 'pending_approval'">
                <p class="wait-message">⏳ Por favor espera mientras revisamos tu pago</p>
              </div>
              <div v-else>
                <p class="wait-message">⏳ Por favor espera mientras revisamos tu pago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rifas en las que ha participado -->
      <div v-if="raffles.length > 0" class="raffles-section">
        <div class="section-header modern-card">
          <h2>Mis Participaciones</h2>
          <span class="raffle-count-badge">{{ raffles.length }} rifa{{ raffles.length > 1 ? 's' : '' }}</span>
        </div>
        
        <div class="raffles-list">
          <div
            v-for="raffleData in raffles"
            :key="raffleData.raffle?._id || 'unknown'"
            class="raffle-group-card modern-card"
          >
            <div class="raffle-group-header">
              <div class="raffle-group-title-section">
                <span class="raffle-group-icon">🎲</span>
                <div>
                  <h3>{{ raffleData.raffle?.title || 'Rifa no disponible' }}</h3>
                  <p class="raffle-group-subtitle">
                    {{ raffleData.tickets.length }} número{{ raffleData.tickets.length > 1 ? 's' : '' }} • 
                    Última participación: {{ formatDate(raffleData.lastParticipationDate) }}
                  </p>
                </div>
              </div>
              <span v-if="raffleData.tickets.some(t => t.isWinner)" class="badge-modern winner">🏆 TIENES GANADOR</span>
            </div>
            
            <div class="tickets-grid-group">
              <div
                v-for="ticket in raffleData.tickets"
                :key="ticket._id"
                class="ticket-card-compact"
                :class="{ winner: ticket.isWinner }"
              >
                <div class="ticket-compact-header">
                  <span class="ticket-number-compact">{{ ticket.numberString }}</span>
                  <span v-if="ticket.isWinner" class="winner-badge-small">🏆</span>
                </div>
                <div class="ticket-compact-info">
                  <span class="ticket-compact-date">{{ formatDate(ticket.createdAt) }}</span>
                  <span class="ticket-compact-order">Pedido #{{ ticket.order?._id?.slice(-8) || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="searched && !loading && raffles.length === 0 && pendingOrders.length === 0" class="empty">
        <span class="empty-icon">📭</span>
        <p>No se encontraron tickets ni pagos pendientes para este email</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';
import { useOrdersStore } from '../store/orders';

const ordersStore = useOrdersStore();

const email = ref('');
const otpCode = ref('');
const otpSent = ref(false);
const raffles = ref([]);
const pendingOrders = ref([]);
const loading = ref(false);
const error = ref(null);
const searched = ref(false);
const uploadingOrders = ref({});

async function requestOTP() {
  if (!email.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    await api.post('/tickets/request-otp', { email: email.value });
    otpSent.value = true;
    otpCode.value = '';
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al enviar el código de verificación';
  } finally {
    loading.value = false;
  }
}

async function verifyOTPAndSearch() {
  if (!email.value || !otpCode.value || otpCode.value.length !== 6) return;
  
  loading.value = true;
  error.value = null;
  searched.value = true;
  
  try {
    const response = await api.get('/tickets/my-tickets', {
      params: { 
        email: email.value,
        otp: otpCode.value
      }
    });
    // El backend ahora devuelve { raffles, pendingOrders }
    if (response.data.raffles !== undefined) {
      raffles.value = response.data.raffles || [];
      pendingOrders.value = response.data.pendingOrders || [];
    } else if (response.data.tickets !== undefined) {
      // Compatibilidad con respuesta antigua (agrupar tickets por rifa)
      const tickets = response.data.tickets || [];
      const ticketsByRaffle = {};
      tickets.forEach(ticket => {
        const raffleId = ticket.raffle?._id?.toString() || 'unknown';
        if (!ticketsByRaffle[raffleId]) {
          ticketsByRaffle[raffleId] = {
            raffle: ticket.raffle,
            tickets: [],
            lastParticipationDate: ticket.createdAt
          };
        }
        ticketsByRaffle[raffleId].tickets.push(ticket);
        if (new Date(ticket.createdAt) > new Date(ticketsByRaffle[raffleId].lastParticipationDate)) {
          ticketsByRaffle[raffleId].lastParticipationDate = ticket.createdAt;
        }
      });
      raffles.value = Object.values(ticketsByRaffle).sort((a, b) => {
        return new Date(b.lastParticipationDate) - new Date(a.lastParticipationDate);
      });
      pendingOrders.value = response.data.pendingOrders || [];
    } else {
      // Respuesta muy antigua (solo array de tickets)
      raffles.value = [];
      pendingOrders.value = [];
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al buscar tickets';
    raffles.value = [];
    pendingOrders.value = [];
    if (err.response?.status === 401) {
      // OTP inválido, resetear
      otpCode.value = '';
    }
  } finally {
    loading.value = false;
  }
}

function resetOTP() {
  otpSent.value = false;
  otpCode.value = '';
  email.value = '';
  error.value = null;
  raffles.value = [];
  pendingOrders.value = [];
  searched.value = false;
}

function formatOTPInput(event) {
  // Solo permitir números
  event.target.value = event.target.value.replace(/\D/g, '');
  otpCode.value = event.target.value;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

async function handleFileSelect(event, orderId) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (file.size > 5 * 1024 * 1024) {
    alert('El archivo es demasiado grande (máx. 5MB)');
    return;
  }
  
  uploadingOrders.value[orderId] = true;
  error.value = null;
  
  try {
    await ordersStore.uploadProof(orderId, file);
    alert('Comprobante subido exitosamente');
    // Recargar los pedidos pendientes
    await verifyOTPAndSearch();
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al subir el comprobante';
    alert(error.value);
  } finally {
    uploadingOrders.value[orderId] = false;
  }
}
</script>

<style scoped>
.my-tickets {
  min-height: 100vh;
  background: #f5f5f5;
}

/* Header styles moved to global styles.css */

.main-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.search-section {
  margin-bottom: 2rem;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-icon {
  font-size: 2rem;
}

.search-section h2 {
  margin: 0;
  color: #333;
  font-size: 1.75rem;
}

.search-form {
  display: flex;
  gap: 1rem;
}

.email-input {
  flex: 1;
}

.btn-arrow {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.btn-primary:hover .btn-arrow {
  transform: translateX(4px);
}

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.tickets-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tickets-section h2 {
  margin: 0;
  color: #333;
  font-size: 1.75rem;
  flex: 1;
}

.ticket-count-badge {
  background: linear-gradient(135deg, var(--primary-color, #007bff), var(--accent-color, #28a745));
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.ticket-card-modern {
  background: #fff;
  border: 2px solid #e9ecef;
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.ticket-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color, #007bff);
}

.ticket-card-modern.winner {
  border-color: #ffc107;
  background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
  box-shadow: 0 8px 24px rgba(255, 193, 7, 0.3);
}

.ticket-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.ticket-title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.ticket-icon {
  font-size: 1.5rem;
}

.ticket-header-modern h3 {
  font-size: 1.25rem;
  color: #1a1a1a;
  margin: 0;
  font-weight: 600;
}

.ticket-number-modern {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  margin-bottom: 1.5rem;
  border: 2px dashed var(--primary-color, #007bff);
}

.number-label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.number-value {
  display: block;
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary-color, #007bff);
  text-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
  font-family: 'Courier New', monospace;
}

.ticket-info-modern {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.info-icon {
  font-size: 1.5rem;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.info-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.empty {
  text-align: center;
  padding: 3rem;
  background: #fff;
  border-radius: 8px;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.pending-orders-section {
  margin-bottom: 2rem;
}

.pending-icon {
  font-size: 2rem;
}

.pending-message {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
  border-radius: 12px;
  border-left: 4px solid #ffc107;
}

.pending-text {
  margin: 0;
  color: #856404;
  line-height: 1.6;
  font-size: 1.05rem;
}

.pending-orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.pending-order-card {
  background: #fff;
  border: 2px solid #ffc107;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.2);
}

.pending-order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255, 193, 7, 0.3);
}

.pending-order-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.pending-order-icon {
  font-size: 2rem;
}

.pending-order-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
  flex: 1;
}

.pending-badge {
  background: linear-gradient(135deg, #ffc107, #ff9800);
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
}

.pending-order-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.pending-order-details .detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.pending-order-details .detail-label {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
}

.pending-order-details .detail-value {
  font-weight: 700;
  color: #333;
  font-size: 1rem;
}

.pending-order-footer {
  padding-top: 1rem;
  border-top: 2px solid #e9ecef;
  text-align: center;
}

.wait-message {
  margin: 0;
  color: #856404;
  font-weight: 600;
  font-size: 0.95rem;
}

.raffles-section {
  margin-bottom: 2rem;
}

.raffle-count-badge {
  background: linear-gradient(135deg, var(--primary-color, #007bff), var(--accent-color, #28a745));
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.raffles-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.raffle-group-card {
  padding: 2rem;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.raffle-group-card:hover {
  border-color: var(--primary-color, #007bff);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.raffle-group-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e9ecef;
  gap: 1rem;
}

.raffle-group-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.raffle-group-icon {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #007bff, #28a745);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.raffle-group-title-section h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 700;
}

.raffle-group-subtitle {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.tickets-grid-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.ticket-card-compact {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  text-align: center;
}

.ticket-card-compact:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color, #007bff);
}

.ticket-card-compact.winner {
  background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
  border-color: #ffc107;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

.ticket-compact-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.ticket-number-compact {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color, #007bff);
  font-family: 'Courier New', monospace;
}

.ticket-card-compact.winner .ticket-number-compact {
  color: #856404;
}

.winner-badge-small {
  font-size: 1.25rem;
}

.ticket-compact-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #666;
}

.ticket-compact-date {
  font-weight: 600;
}

.ticket-compact-order {
  color: #999;
}

.upload-proof-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e9ecef;
}

.upload-prompt {
  margin: 0 0 0.75rem 0;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.upload-proof-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.upload-proof-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color, #007bff), var(--accent-color, #28a745));
  color: #fff;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  text-align: center;
}

.upload-proof-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
}

.uploading-status {
  color: #666;
  font-size: 0.9rem;
  font-style: italic;
}

.otp-description {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  padding: 1rem;
  background: linear-gradient(135deg, #e7f3ff 0%, #d0e7ff 100%);
  border-radius: 12px;
  border-left: 4px solid var(--primary-color, #007bff);
}

.otp-verification {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.otp-card {
  padding: 2rem;
  border: 2px solid #e9ecef;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.otp-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e9ecef;
}

.otp-card-icon {
  font-size: 3rem;
  background: linear-gradient(135deg, #007bff, #28a745);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.otp-card-title-section h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.otp-card-subtitle {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.otp-card-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.otp-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.otp-input-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.otp-label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.otp-input {
  text-align: center;
  font-size: 2rem;
  letter-spacing: 0.5rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  padding: 1.5rem;
  border: 3px solid #e9ecef;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.otp-input:focus {
  border-color: var(--primary-color, #007bff);
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1);
  outline: none;
}

.otp-hint-text {
  font-size: 0.85rem;
  color: #6c757d;
  text-align: center;
  margin-top: 0.5rem;
  font-style: italic;
}

.otp-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-secondary {
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
</style>

