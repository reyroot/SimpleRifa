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
      <div class="details-grid">
        <div class="detail-card">
          <div class="detail-icon">💰</div>
          <div class="detail-content">
            <span class="detail-label">Precio por número</span>
            <span class="detail-value">${{ raffle.pricePerNumber.toLocaleString() }}</span>
          </div>
        </div>
        <div class="detail-card">
          <div class="detail-icon">🎫</div>
          <div class="detail-content">
            <span class="detail-label">Números totales</span>
            <span class="detail-value">{{ raffle.maxNumbers.toLocaleString() }}</span>
          </div>
        </div>
        <div v-if="raffle.drawDate" class="detail-card">
          <div class="detail-icon">📅</div>
          <div class="detail-content">
            <span class="detail-label">Fecha de sorteo</span>
            <span class="detail-value">{{ formatDate(raffle.drawDate) }}</span>
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
defineProps({
  raffle: {
    type: Object,
    required: true
  }
});

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
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
  min-height: 600px;
}

.raffle-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.image-container {
  position: relative;
  width: 100%;
  height: 350px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  padding: 2.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.card-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.2;
  flex: 1;
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

.description {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
  line-height: 1.6;
  flex: 1;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.detail-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.detail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.detail-icon {
  font-size: 2rem;
  line-height: 1;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.detail-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color, #007bff);
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1.25rem 2rem;
  background: linear-gradient(135deg, var(--primary-color, #007bff), var(--accent-color, #28a745));
  color: #fff;
  text-align: center;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
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

