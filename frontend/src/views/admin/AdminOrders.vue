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
        
        <div class="order-info-summary">
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
            <strong>Cantidad:</strong> {{ order.quantity }} números
          </div>
          <div class="info-row">
            <strong>Total:</strong> {{ currencySymbol }} {{ order.totalAmount.toLocaleString() }}
          </div>
          <div class="info-row">
            <strong>Fecha:</strong> {{ formatDate(order.createdAt) }}
          </div>
        </div>

        <div class="order-actions">
          <button @click="viewOrderDetails(order)" class="btn-view-details">Ver Detalles</button>
          <div v-if="order.status === 'pending_approval' || order.status === 'pending_payment'" class="approval-actions">
            <button v-if="order.status === 'pending_approval'" @click="approveOrder(order._id)" class="btn-approve">Aprobar</button>
            <button v-if="order.status === 'pending_approval'" @click="cancelOrder(order._id)" class="btn-cancel">Rechazar</button>
            <button v-if="order.status === 'pending_payment' || order.status === 'pending_approval'" @click="deleteOrder(order._id)" class="btn-delete-order">Eliminar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para ver detalles del pedido -->
    <div v-if="selectedOrder" class="order-details-modal" @click="closeOrderDetails">
      <div class="order-details-content" @click.stop>
        <button class="modal-close" @click="closeOrderDetails">✕</button>
        
        <div class="order-details-header">
          <h2>Detalles del Pedido #{{ selectedOrder._id.slice(-8) }}</h2>
          <span class="status-badge" :class="selectedOrder.status">{{ getStatusText(selectedOrder.status) }}</span>
        </div>

        <div class="order-details-body">
          <div class="details-section">
            <h3>Información del Pedido</h3>
            <div class="details-grid">
              <div class="detail-item">
                <strong>Rifa:</strong>
                <span>{{ selectedOrder.raffle?.title }}</span>
              </div>
              <div class="detail-item">
                <strong>Cantidad:</strong>
                <span>{{ selectedOrder.quantity }} números</span>
              </div>
              <div class="detail-item">
                <strong>Total:</strong>
                <span>{{ currencySymbol }} {{ selectedOrder.totalAmount.toLocaleString() }}</span>
              </div>
              <div class="detail-item">
                <strong>Fecha de creación:</strong>
                <span>{{ formatDate(selectedOrder.createdAt) }}</span>
              </div>
              <div v-if="selectedOrder.paymentApprovalDate" class="detail-item">
                <strong>Fecha de aprobación:</strong>
                <span>{{ formatDate(selectedOrder.paymentApprovalDate) }}</span>
              </div>
            </div>
          </div>

          <div class="details-section">
            <h3>Información del Comprador</h3>
            <div class="details-grid">
              <div class="detail-item">
                <strong>Nombre:</strong>
                <span>{{ selectedOrder.buyerInfo.name }}</span>
              </div>
              <div class="detail-item">
                <strong>Email:</strong>
                <span>{{ selectedOrder.buyerInfo.email }}</span>
              </div>
              <div class="detail-item">
                <strong>Teléfono:</strong>
                <span>{{ selectedOrder.buyerInfo.phone }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedOrder.paymentMethod" class="details-section">
            <h3>Método de Pago</h3>
            <div class="details-grid">
              <div class="detail-item">
                <strong>Método:</strong>
                <span>{{ selectedOrder.paymentMethod.name }}</span>
              </div>
              <div v-if="selectedOrder.paymentMethod.details" class="detail-item full-width">
                <strong>Detalles:</strong>
                <div v-html="selectedOrder.paymentMethod.details"></div>
              </div>
            </div>
          </div>

          <div v-if="selectedOrder.paymentProofUrl" class="details-section">
            <h3>Comprobante de Pago</h3>
            <button @click="showProofModal(selectedOrder.paymentProofUrl)" class="proof-view-btn">
              Ver Comprobante
            </button>
          </div>

          <div v-if="selectedOrder.status === 'completed' && selectedOrder.tickets && selectedOrder.tickets.length > 0" class="details-section">
            <h3>Números Asignados</h3>
            <div class="tickets-list">
              <span 
                v-for="ticket in selectedOrder.tickets" 
                :key="ticket._id || ticket.numberString"
                class="ticket-number"
                :class="{ winner: ticket.isWinner }"
              >
                {{ ticket.numberString }}
                <span v-if="ticket.isWinner" class="winner-badge">🏆</span>
              </span>
            </div>
          </div>
        </div>

        <div v-if="selectedOrder.status === 'pending_approval' || selectedOrder.status === 'pending_payment'" class="order-details-footer">
          <button v-if="selectedOrder.status === 'pending_approval'" @click="approveOrder(selectedOrder._id)" class="btn-approve">Aprobar Pedido</button>
          <button v-if="selectedOrder.status === 'pending_approval'" @click="cancelOrder(selectedOrder._id)" class="btn-cancel">Rechazar Pedido</button>
          <button v-if="selectedOrder.status === 'pending_payment' || selectedOrder.status === 'pending_approval'" @click="deleteOrder(selectedOrder._id)" class="btn-delete-order">Eliminar Pedido</button>
        </div>
      </div>
    </div>

    <!-- Modal para ver comprobante -->
    <div v-if="showModal" class="proof-modal" @click="closeProofModal">
      <div class="proof-modal-content" @click.stop>
        <button class="proof-modal-close" @click="closeProofModal">✕</button>
        <img :src="proofModalImage" alt="Comprobante de pago" class="proof-modal-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOrdersStore } from '../../store/orders';
import { useConfigStore } from '../../store/config';

const ordersStore = useOrdersStore();
const configStore = useConfigStore();

const currencySymbol = computed(() => {
  return configStore.config.currency === 'VES' ? 'Bs' : '$';
});

const selectedStatus = ref(null);
const selectedOrder = ref(null);
const proofModalImage = ref(null);
const showModal = ref(false);

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
      await ordersStore.fetchOrders();
      if (selectedOrder.value && selectedOrder.value._id === orderId) {
        // Actualizar el pedido seleccionado
        const updatedOrder = ordersStore.orders.find(o => o._id === orderId);
        if (updatedOrder) {
          selectedOrder.value = updatedOrder;
        }
      }
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
      await ordersStore.fetchOrders();
      if (selectedOrder.value && selectedOrder.value._id === orderId) {
        closeOrderDetails();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Error al rechazar el pedido');
    }
  }
}

async function deleteOrder(orderId) {
  if (confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.')) {
    try {
      await ordersStore.deleteOrder(orderId);
      alert('Pedido eliminado exitosamente');
      await ordersStore.fetchOrders();
      if (selectedOrder.value && selectedOrder.value._id === orderId) {
        closeOrderDetails();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Error al eliminar el pedido');
    }
  }
}

function showProofModal(imageUrl) {
  proofModalImage.value = imageUrl;
  showModal.value = true;
}

function closeProofModal() {
  showModal.value = false;
  proofModalImage.value = null;
}

function viewOrderDetails(order) {
  selectedOrder.value = order;
}

function closeOrderDetails() {
  selectedOrder.value = null;
}
</script>

<style scoped>
.admin-orders {
  background: #fff;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
  font-size: 1.5rem;
}

@media (min-width: 768px) {
  .admin-orders {
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  }
  
  h2 {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    font-size: 2rem;
  }
}

.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

@media (min-width: 768px) {
  .filters {
    gap: 0.75rem;
    margin-bottom: 2rem;
    padding: 1.5rem;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
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
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

@media (min-width: 768px) {
  .order-card {
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
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

.order-info-summary {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .order-info-summary {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
  }
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
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.approval-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.approval-actions button {
  width: 100%;
}

@media (min-width: 768px) {
  .order-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  
  .approval-actions {
    flex-direction: row;
    width: auto;
  }
  
  .approval-actions button {
    width: auto;
  }
}

.btn-view-details {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color, #007bff), var(--accent-color, #28a745));
  color: #fff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-view-details:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
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

.btn-delete-order {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #6c757d, #5a6268);
  color: #fff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

.btn-delete-order:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
}

.proof-view-btn {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color, #007bff);
  color: #fff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.proof-view-btn:hover {
  background: var(--accent-color, #28a745);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
}

.order-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.order-details-content {
  position: relative;
  background: #fff;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

@media (min-width: 768px) {
  .order-details-modal {
    padding: 2rem;
  }
  
  .order-details-content {
    border-radius: 20px;
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #dc3545;
  color: #fff;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 1001;
}

.modal-close:hover {
  background: #c82333;
  transform: scale(1.1);
}

.order-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 2px solid #e9ecef;
}

.order-details-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.75rem;
}

.order-details-body {
  padding: 2rem;
}

.details-section {
  margin-bottom: 2rem;
}

.details-section:last-child {
  margin-bottom: 0;
}

.details-section h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .details-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item strong {
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span,
.detail-item div {
  color: #333;
  font-size: 1rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.order-details-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 2px solid #e9ecef;
}

.order-details-footer button {
  width: 100%;
}

@media (min-width: 768px) {
  .order-details-footer {
    flex-direction: row;
    gap: 1rem;
    padding: 2rem;
    justify-content: flex-end;
  }
  
  .order-details-footer button {
    width: auto;
  }
}

.proof-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.proof-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
}

.proof-modal-close {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #dc3545;
  color: #fff;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 1001;
}

.proof-modal-close:hover {
  background: #c82333;
  transform: scale(1.1);
}

.proof-modal-image {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
}

.tickets-section {
  grid-column: 1 / -1;
}

.tickets-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.ticket-number {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #e7f3ff 0%, #d0e7ff 100%);
  border: 2px solid var(--primary-color, #007bff);
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--primary-color, #007bff);
}

.ticket-number.winner {
  background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
  border-color: #ffc107;
  color: #856404;
}

.winner-badge {
  font-size: 1rem;
}
</style>

