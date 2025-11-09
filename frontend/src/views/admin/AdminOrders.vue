<template>
  <div class="admin-orders">
    <h2 class="app-header-page-title">Gestión de Pedidos</h2>

    <div class="filters">
      <button
        v-for="status in statuses"
        :key="status.value"
        @click="selectedStatus = status.value"
        class="filter-btn"
        :class="{ active: selectedStatus === status.value }"
      >
        {{ status.label }}
      </button>
    </div>

    <div v-if="ordersStore.loading" class="loading">Cargando...</div>
    <div v-else-if="ordersStore.error" class="error">{{ ordersStore.error }}</div>
    <div v-else-if="filteredOrders.length === 0" class="empty">No hay pedidos</div>
    <div v-else class="orders-list">
      <div
        v-for="order in filteredOrders"
        :key="order._id"
        class="order-card"
        :class="order.status"
      >
        <div class="order-header">
          <h3>Pedido #{{ order._id.slice(-8) }}</h3>
          <span class="status-badge" :class="order.status">{{ getStatusText(order.status) }}</span>
        </div>
        
        <div class="order-info">
          <div class="info-row">
            <strong>Rifa:</strong> {{ order.raffle?.title }}
          </div>
          <div class="info-row">
            <strong>Comprador:</strong> {{ order.buyerInfo.name }}
          </div>
          <div class="info-row">
            <strong>Email:</strong> {{ order.buyerInfo.email }}
          </div>
          <div class="info-row">
            <strong>Teléfono:</strong> {{ order.buyerInfo.phone }}
          </div>
          <div class="info-row">
            <strong>Cantidad:</strong> {{ order.quantity }} números
          </div>
          <div class="info-row">
            <strong>Total:</strong> ${{ order.totalAmount.toLocaleString() }}
          </div>
          <div v-if="order.paymentMethod" class="info-row">
            <strong>Método de pago:</strong> {{ order.paymentMethod.name }}
          </div>
          <div v-if="order.paymentProofUrl" class="info-row">
            <strong>Comprobante:</strong>
            <a :href="order.paymentProofUrl" target="_blank" class="proof-link">Ver comprobante</a>
          </div>
          <div class="info-row">
            <strong>Fecha:</strong> {{ formatDate(order.createdAt) }}
          </div>
        </div>

        <div v-if="order.status === 'pending_approval'" class="order-actions">
          <button @click="approveOrder(order._id)" class="btn-approve">Aprobar</button>
          <button @click="cancelOrder(order._id)" class="btn-cancel">Rechazar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOrdersStore } from '../../store/orders';

const ordersStore = useOrdersStore();

const selectedStatus = ref(null);

const statuses = [
  { value: null, label: 'Todos' },
  { value: 'pending_payment', label: 'Pago Pendiente' },
  { value: 'pending_approval', label: 'Pendiente Aprobación' },
  { value: 'completed', label: 'Completados' },
  { value: 'cancelled', label: 'Cancelados' }
];

const filteredOrders = computed(() => {
  if (!selectedStatus.value) return ordersStore.orders;
  return ordersStore.orders.filter(o => o.status === selectedStatus.value);
});

onMounted(() => {
  ordersStore.fetchOrders();
});

function getStatusText(status) {
  const map = {
    pending_payment: 'Pago Pendiente',
    pending_approval: 'Pendiente Aprobación',
    completed: 'Completado',
    cancelled: 'Cancelado'
  };
  return map[status] || status;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function approveOrder(orderId) {
  if (confirm('¿Aprobar este pedido?')) {
    try {
      await ordersStore.approveOrder(orderId);
      alert('Pedido aprobado exitosamente');
      ordersStore.fetchOrders();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al aprobar el pedido');
    }
  }
}

async function cancelOrder(orderId) {
  if (confirm('¿Rechazar este pedido?')) {
    try {
      await ordersStore.cancelOrder(orderId);
      alert('Pedido rechazado');
      ordersStore.fetchOrders();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al rechazar el pedido');
    }
  }
}
</script>

<style scoped>
.admin-orders {
  background: #fff;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

h2 {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e9ecef;
}

.filters {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.filter-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e9ecef;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-btn:hover {
  background: rgba(0, 123, 255, 0.05);
  border-color: var(--primary-color, #007bff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
}

.filter-btn.active {
  background: linear-gradient(135deg, var(--primary-color, #007bff), var(--accent-color, #28a745));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background: #fff;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color, #007bff);
}

.order-card.pending_approval {
  border-color: #ffc107;
  background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
  box-shadow: 0 8px 24px rgba(255, 193, 7, 0.2);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ddd;
}

.order-header h3 {
  margin: 0;
  color: #333;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
}

.status-badge.pending_payment {
  background: linear-gradient(135deg, #ffc107, #ff9800);
  color: #333;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

.status-badge.pending_approval {
  background: linear-gradient(135deg, #ffc107, #ff9800);
  color: #333;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

.status-badge.completed {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: #fff;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.status-badge.cancelled {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: #fff;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.order-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.info-row {
  font-size: 0.9rem;
}

.proof-link {
  color: #007bff;
  text-decoration: none;
  margin-left: 0.5rem;
}

.proof-link:hover {
  text-decoration: underline;
}

.order-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.btn-approve, .btn-cancel {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-approve {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: #fff;
}

.btn-approve:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

.btn-cancel {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: #fff;
}

.btn-cancel:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
}
</style>

