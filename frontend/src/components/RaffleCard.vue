<template>
  <div class="raffle-card">
    <div v-if="raffle.imageUrls && raffle.imageUrls.length > 0" class="image-container">
      <img :src="raffle.imageUrls[0]" :alt="raffle.title" />
      <div class="image-overlay"></div>
    </div>
    <div v-else class="image-container no-image">
      <div class="placeholder-image">
        <span class="placeholder-icon">🎲</span>
      </div>
      <div class="image-overlay"></div>
    </div>
    <div class="card-content">
      <div class="card-header">
        <h2 class="card-title">{{ raffle.title }}</h2>
        <span class="status-badge active">Activa</span>
      </div>
      <p v-if="raffle.description" class="description">{{ raffle.description }}</p>
      <div class="details-compact">
        <div class="detail-row">
          <span class="detail-icon-small">💰</span>
          <span class="detail-text">{{ currencySymbol }} {{ raffle.pricePerNumber.toLocaleString() }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-icon-small">🎫</span>
          <span class="detail-text">{{ raffle.maxNumbers.toLocaleString() }} números</span>
        </div>
        <div v-if="raffle.drawDate" class="detail-row">
          <span class="detail-icon-small">📅</span>
          <span class="detail-text">{{ formatDate(raffle.drawDate) }}</span>
        </div>
        <div v-if="raffle.soldPercentage !== undefined" class="detail-row sold-row">
          <span class="detail-icon-small">📊</span>
          <span class="detail-text">{{ raffle.soldPercentage }}% vendido</span>
          <div class="progress-bar-mini">
            <div class="progress-fill-mini" :style="{ width: raffle.soldPercentage + '%' }"></div>
          </div>
        </div>
      </div>
      <router-link :to="`/raffle/${raffle._id}`" class="btn-primary">
        <span>Participar en esta rifa</span>
        <span class="btn-arrow">→</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useConfigStore } from '../store/config';

const props = defineProps({
  raffle: {
    type: Object,
    required: true
  }
});

const configStore = useConfigStore();

const currencySymbol = computed(() => {
  return configStore.config.currency === 'VES' ? 'Bs' : '$';
});

function formatDate(dateString) {
  const date = new Date(dateString);
  // Formato más compacto para mejor visualización
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
</script>

<style scoped>
.raffle-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
}

/* Mobile First - Responsive */
@media (max-width: 768px) {
  .raffle-card {
    min-height: auto;
    border-radius: 16px;
  }
  
  .card-content {
    padding: 1.25rem;
  }
  
  .card-title {
    font-size: 1.25rem;
  }
  
  .details-compact {
    padding: 0.875rem;
    gap: 0.5rem;
  }
  
  .detail-row {
    font-size: 0.85rem;
  }
  
  .detail-icon-small {
    font-size: 1rem;
  }
  
  .btn-primary {
    padding: 0.875rem 1.25rem;
    font-size: 0.95rem;
  }
}

@media (min-width: 768px) {
  .card-content {
    padding: 2rem;
  }
  
  .card-title {
    font-size: 1.75rem;
  }
}

.raffle-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.image-container {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

@media (min-width: 768px) {
  .image-container {
    height: 320px;
  }
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.raffle-card:hover .image-container img {
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.placeholder-icon {
  font-size: 6rem;
  opacity: 0.3;
}

.card-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 0.75rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
  flex: 1;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge.active {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: #fff;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.description {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.details-compact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #333;
}

.detail-row.sold-row {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.detail-icon-small {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.detail-text {
  font-weight: 600;
  color: var(--primary-color, #007bff);
  flex: 1;
}

.progress-bar-mini {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color, #007bff), var(--accent-color, #28a745));
  transition: width 0.5s ease;
  border-radius: 3px;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color, #007bff), var(--accent-color, #28a745));
  color: #fff;
  text-align: center;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
  margin-top: auto;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
}

.btn-arrow {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.btn-primary:hover .btn-arrow {
  transform: translateX(4px);
}
</style>

