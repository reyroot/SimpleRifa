<template>
  <div class="admin-dashboard">
    <h2>Dashboard</h2>
    <div v-if="loading" class="loading">Cargando...</div>
    <div v-else class="stats-grid">
      <div class="stat-card-modern">
        <div class="stat-icon">⏳</div>
        <div class="stat-content">
          <h3>Pedidos Pendientes</h3>
          <p class="stat-number">{{ pendingOrders }}</p>
        </div>
      </div>
      <div class="stat-card-modern">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>Pedidos Completados</h3>
          <p class="stat-number">{{ completedOrders }}</p>
        </div>
      </div>
      <div class="stat-card-modern">
        <div class="stat-icon">🎲</div>
        <div class="stat-content">
          <h3>Rifas Activas</h3>
          <p class="stat-number">{{ activeRaffles }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useOrdersStore } from '../../store/orders';
import { useRafflesStore } from '../../store/raffles';
import api from '../../services/api';

const ordersStore = useOrdersStore();
const rafflesStore = useRafflesStore();

const loading = ref(true);
const pendingOrders = ref(0);
const completedOrders = ref(0);
const activeRaffles = ref(0);

onMounted(async () => {
  try {
    const [ordersResponse, rafflesResponse] = await Promise.all([
      api.get('/admin/orders'),
      api.get('/admin/raffles', { params: { status: 'active' } })
    ]);
    
    const orders = ordersResponse.data;
    pendingOrders.value = orders.filter(o => o.status === 'pending_approval').length;
    completedOrders.value = orders.filter(o => o.status === 'completed').length;
    activeRaffles.value = rafflesResponse.data.length;
  } catch (error) {
    console.error('Error loading dashboard:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.admin-dashboard h2 {
  margin-bottom: 2rem;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.stat-card-modern {
  background: #fff;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  
  .stat-card-modern {
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    gap: 1.5rem;
  }
}

.stat-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.stat-content {
  flex: 1;
}

.stat-card-modern h3 {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color, #007bff);
  margin: 0;
  line-height: 1;
}

@media (min-width: 768px) {
  .stat-icon {
    font-size: 3rem;
  }
  
  .stat-card-modern h3 {
    margin: 0 0 0.75rem 0;
    font-size: 0.95rem;
  }
  
  .stat-number {
    font-size: 3rem;
  }
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}
</style>

