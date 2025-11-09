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
        <form @submit.prevent="searchTickets" class="search-form">
          <input
            v-model="email"
            type="email"
            placeholder="Ingresa tu email"
            required
            class="modern-input email-input"
          />
          <button type="submit" class="btn-primary" :disabled="loading">
            <span>{{ loading ? 'Buscando...' : 'Buscar' }}</span>
            <span v-if="!loading" class="btn-arrow">→</span>
          </button>
        </form>
      </div>

      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="tickets.length > 0" class="tickets-section modern-card">
        <div class="section-header">
          <h2>Mis Números</h2>
          <span class="ticket-count-badge">{{ tickets.length }}</span>
        </div>
        <div class="tickets-grid">
          <div
            v-for="ticket in tickets"
            :key="ticket._id"
            class="ticket-card-modern"
            :class="{ winner: ticket.isWinner }"
          >
            <div class="ticket-header-modern">
              <div class="ticket-title-section">
                <span class="ticket-icon">🎫</span>
                <h3>{{ ticket.raffle.title }}</h3>
              </div>
              <span v-if="ticket.isWinner" class="badge-modern winner">🏆 GANADOR</span>
            </div>
            <div class="ticket-number-modern">
              <span class="number-label">Número</span>
              <span class="number-value">{{ ticket.numberString }}</span>
            </div>
            <div class="ticket-info-modern">
              <div class="info-row">
                <span class="info-icon">📋</span>
                <div class="info-text">
                  <span class="info-label">Pedido</span>
                  <span class="info-value">#{{ ticket.order._id.slice(-8) }}</span>
                </div>
              </div>
              <div class="info-row">
                <span class="info-icon">📅</span>
                <div class="info-text">
                  <span class="info-label">Fecha</span>
                  <span class="info-value">{{ formatDate(ticket.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="searched && !loading" class="empty">
        No se encontraron tickets para este email
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';

const email = ref('');
const tickets = ref([]);
const loading = ref(false);
const error = ref(null);
const searched = ref(false);

async function searchTickets() {
  if (!email.value) return;
  
  loading.value = true;
  error.value = null;
  searched.value = true;
  
  try {
    const response = await api.get('/tickets/my-tickets', {
      params: { email: email.value }
    });
    tickets.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al buscar tickets';
    tickets.value = [];
  } finally {
    loading.value = false;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
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
</style>

