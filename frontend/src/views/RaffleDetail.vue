<template>
  <div class="raffle-detail">
    <header class="app-header">
      <div class="app-header-content">
        <router-link 
          :to="isAdmin ? '/admin/raffles' : '/'" 
          class="app-back-link"
        >
          ← {{ isAdmin ? 'Volver al Panel Admin' : 'Volver' }}
        </router-link>
      </div>
    </header>

    <main class="main-content">
      <div v-if="rafflesStore.loading" class="loading">Cargando...</div>
      <div v-else-if="rafflesStore.error" class="error">{{ rafflesStore.error }}</div>
      <div v-else-if="rafflesStore.currentRaffle" class="detail-container modern-card">
        <div class="images-section">
          <div v-if="rafflesStore.currentRaffle.imageUrls && rafflesStore.currentRaffle.imageUrls.length > 0" class="images-grid">
            <img
              v-for="(url, index) in rafflesStore.currentRaffle.imageUrls"
              :key="index"
              :src="url"
              :alt="rafflesStore.currentRaffle.title"
              class="detail-image"
            />
          </div>
          <div v-else class="no-image">
            <div class="placeholder-image-large">
              <span class="placeholder-icon-large">🎲</span>
              <p>Sin imágenes</p>
            </div>
          </div>
        </div>

        <div class="info-section">
          <div class="header-section">
            <h1>{{ rafflesStore.currentRaffle.title }}</h1>
            <span class="badge-modern" :class="rafflesStore.currentRaffle.status">{{ getStatusText(rafflesStore.currentRaffle.status) }}</span>
          </div>
          <p v-if="rafflesStore.currentRaffle.description" class="description">{{ rafflesStore.currentRaffle.description }}</p>

          <div class="info-grid-modern">
            <div class="detail-card-modern">
              <div class="detail-icon">💰</div>
              <div class="detail-content">
                <span class="detail-label">Precio por número</span>
                <span class="detail-value">${{ rafflesStore.currentRaffle.pricePerNumber.toLocaleString() }}</span>
              </div>
            </div>
            <div class="detail-card-modern">
              <div class="detail-icon">🎫</div>
              <div class="detail-content">
                <span class="detail-label">Números totales</span>
                <span class="detail-value">{{ rafflesStore.currentRaffle.maxNumbers.toLocaleString() }}</span>
              </div>
            </div>
            <div v-if="rafflesStore.currentRaffle.drawDate" class="detail-card-modern">
              <div class="detail-icon">📅</div>
              <div class="detail-content">
                <span class="detail-label">Fecha de sorteo</span>
                <span class="detail-value">{{ formatDate(rafflesStore.currentRaffle.drawDate) }}</span>
              </div>
            </div>
          </div>

          <div v-if="rafflesStore.currentRaffle.status === 'active'" class="action-section">
            <router-link :to="`/checkout/${rafflesStore.currentRaffle._id}`" class="btn-primary">
              <span>Comprar Números</span>
              <span class="btn-arrow">→</span>
            </router-link>
          </div>

          <div v-if="rafflesStore.currentRaffle.winningTickets && rafflesStore.currentRaffle.winningTickets.length > 0" class="winners-section-modern">
            <div class="winners-header">
              <span class="winner-icon">🏆</span>
              <h2>Ganadores</h2>
            </div>
            <div class="winners-grid">
              <div v-for="ticket in rafflesStore.currentRaffle.winningTickets" :key="ticket._id" class="winner-ticket-modern">
                <span class="winner-label">Número ganador</span>
                <span class="winner-number">{{ ticket.numberString }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useRafflesStore } from '../store/raffles';
import { useAuthStore } from '../store/auth';

const route = useRoute();
const rafflesStore = useRafflesStore();
const authStore = useAuthStore();

const isAdmin = computed(() => authStore.hasToken);

onMounted(() => {
  rafflesStore.fetchRaffleById(route.params.id);
});

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getStatusText(status) {
  const statusMap = {
    draft: 'Borrador',
    active: 'Activa',
    drawing_pending: 'Sorteo pendiente',
    finished: 'Finalizada'
  };
  return statusMap[status] || status;
}
</script>

<style scoped>
.raffle-detail {
  min-height: 100vh;
  background: #f5f5f5;
}

/* Header styles moved to global styles.css */

.main-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
  background: #fff;
  border-radius: 8px;
}

.error {
  color: #dc3545;
}

.detail-container {
  overflow: hidden;
}

.images-section {
  margin-bottom: 2rem;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.detail-image:hover {
  transform: scale(1.05);
}

.no-image {
  padding: 4rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: #fff;
}

.placeholder-image-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.placeholder-icon-large {
  font-size: 5rem;
  opacity: 0.5;
}

.info-section {
  padding: 0;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-section h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  flex: 1;
}

.description {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.8;
  font-size: 1.1rem;
}

.info-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detail-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.detail-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color, #007bff);
}

.action-section {
  margin-top: 2.5rem;
}

.btn-arrow {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.btn-primary:hover .btn-arrow {
  transform: translateX(4px);
}

.winners-section-modern {
  margin-top: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
  border-radius: 16px;
  border: 2px solid #ffc107;
  box-shadow: 0 8px 24px rgba(255, 193, 7, 0.2);
}

.winners-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.winner-icon {
  font-size: 2rem;
}

.winners-header h2 {
  margin: 0;
  color: #856404;
  font-size: 1.75rem;
}

.winners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.winner-ticket-modern {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.winner-label {
  font-size: 0.85rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.winner-number {
  font-size: 2rem;
  font-weight: 700;
  color: #ffc107;
  text-shadow: 0 2px 4px rgba(255, 193, 7, 0.3);
}
</style>

