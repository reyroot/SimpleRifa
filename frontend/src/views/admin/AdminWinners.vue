<template>
  <div class="admin-winners">
    <div class="header-section">
      <h1>🏆 Ganadores</h1>
      <div class="header-actions">
        <select v-model="selectedRaffle" @change="fetchWinners" class="raffle-filter">
          <option value="">Todas las rifas</option>
          <option v-for="raffle in raffles" :key="raffle._id" :value="raffle._id">
            {{ raffle.title }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading">Cargando ganadores...</div>
    
    <div v-else-if="winners.length === 0" class="empty-state">
      <span class="empty-icon">🎯</span>
      <p>No hay ganadores registrados{{ selectedRaffle ? ' para esta rifa' : '' }}</p>
    </div>

    <div v-else class="winners-list">
      <div
        v-for="winner in winners"
        :key="winner.email"
        class="winner-card modern-card"
      >
        <div class="winner-header">
          <div class="winner-badge-large">🏆</div>
          <div class="winner-info">
            <h3>{{ winner.name }}</h3>
            <p class="winner-email">{{ winner.email }}</p>
          </div>
        </div>
        
        <div class="winner-details">
          <div class="detail-item">
            <span class="detail-icon">📞</span>
            <div>
              <span class="detail-label">Teléfono</span>
              <span class="detail-value">{{ winner.phone }}</span>
            </div>
          </div>
          
          <div class="detail-item">
            <span class="detail-icon">🎫</span>
            <div>
              <span class="detail-label">Rifa</span>
              <span class="detail-value">{{ winner.raffle?.title || 'N/A' }}</span>
            </div>
          </div>
          
          <div class="detail-item">
            <span class="detail-icon">🔢</span>
            <div>
              <span class="detail-label">Números Ganadores</span>
              <div class="winning-numbers">
                <span
                  v-for="number in winner.winningNumbers"
                  :key="number"
                  class="winning-number-badge"
                >
                  {{ number }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRafflesStore } from '../../store/raffles';
import api from '../../services/api';

const rafflesStore = useRafflesStore();
const winners = ref([]);
const loading = ref(false);
const selectedRaffle = ref('');

onMounted(async () => {
  await rafflesStore.fetchRaffles(null, true);
  await fetchWinners();
});

async function fetchWinners() {
  loading.value = true;
  try {
    const params = selectedRaffle.value ? { raffleId: selectedRaffle.value } : {};
    const response = await api.get('/admin/winners', { params });
    winners.value = response.data;
  } catch (error) {
    console.error('Error fetching winners:', error);
    alert(error.response?.data?.error || 'Error al cargar ganadores');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.admin-winners {
  background: #fff;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e9ecef;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-section h1 {
  margin: 0;
  color: #333;
  font-size: 2rem;
}

.raffle-filter {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.raffle-filter:hover {
  border-color: var(--primary-color, #007bff);
}

.raffle-filter:focus {
  outline: none;
  border-color: var(--primary-color, #007bff);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.winners-list {
  display: grid;
  gap: 1.5rem;
}

.winner-card {
  padding: 2rem;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.winner-card:hover {
  border-color: #ffc107;
  box-shadow: 0 8px 24px rgba(255, 193, 7, 0.2);
  transform: translateY(-2px);
}

.winner-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e9ecef;
}

.winner-badge-large {
  font-size: 3rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.winner-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.winner-email {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.winner-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.detail-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.detail-item > div {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.85rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.detail-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.winning-numbers {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.winning-number-badge {
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #ffc107, #ff9800);
  color: #333;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
  border: 2px solid #ffc107;
}
</style>

