<template>
  <div class="admin-raffles">
    <div class="header-section">
      <h2 class="app-header-page-title">Historial de Rifas</h2>
      <button @click="showCreateModal = true" class="btn-primary">
        <span>➕</span>
        <span>Crear Rifa</span>
      </button>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <div class="filters">
        <button
          v-for="status in statusFilters"
          :key="status.value"
          @click="selectedStatus = status.value"
          class="filter-btn"
          :class="{ active: selectedStatus === status.value }"
        >
          {{ status.label }}
        </button>
      </div>
      <div class="stats-summary">
        <span class="stat-item">Total: {{ filteredRaffles.length }}</span>
        <span class="stat-item">Activas: {{ activeCount }}</span>
        <span class="stat-item">Finalizadas: {{ finishedCount }}</span>
      </div>
    </div>

    <div v-if="rafflesStore.loading" class="loading">Cargando historial...</div>
    <div v-else-if="rafflesStore.error" class="error">{{ rafflesStore.error }}</div>
    <div v-else-if="filteredRaffles.length === 0" class="empty">No hay rifas con el filtro seleccionado</div>
    <div v-else class="raffles-table">
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Estado</th>
            <th>Números</th>
            <th>Vendidos</th>
            <th>Precio Unit.</th>
            <th>Fecha Creación</th>
            <th>Fecha Sorteo</th>
            <th>Ganadores</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="raffle in filteredRaffles" :key="raffle._id" :class="getRowClass(raffle.status)">
            <td>
              <strong>{{ raffle.title }}</strong>
              <div v-if="raffle.description" class="description-preview">
                {{ truncateText(raffle.description, 50) }}
              </div>
            </td>
            <td>
              <span class="status-badge" :class="raffle.status">{{ getStatusText(raffle.status) }}</span>
            </td>
            <td>{{ raffle.maxNumbers.toLocaleString() }}</td>
            <td>
              <span class="sold-count">{{ getSoldCount(raffle) }}</span>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: getProgressPercentage(raffle) + '%' }"
                ></div>
              </div>
            </td>
            <td>${{ raffle.pricePerNumber.toLocaleString() }}</td>
            <td>{{ formatDate(raffle.createdAt) }}</td>
            <td>
              <span v-if="raffle.drawDate">{{ formatDate(raffle.drawDate) }}</span>
              <span v-else class="no-date">-</span>
            </td>
            <td>
              <span v-if="raffle.winningTickets && raffle.winningTickets.length > 0" class="winners-info">
                {{ raffle.winningTickets.length }} ganador(es)
              </span>
              <span v-else class="no-winners">-</span>
            </td>
            <td class="actions">
              <button @click="editRaffle(raffle)" class="btn-edit" title="Editar">✏️</button>
              <button 
                v-if="raffle.status === 'active' || raffle.status === 'drawing_pending'" 
                @click="drawRaffle(raffle._id)" 
                class="btn-draw"
                title="Realizar sorteo"
              >
                🎲
              </button>
              <button @click="viewDetails(raffle)" class="btn-view" title="Ver detalles">👁️</button>
              <button @click="deleteRaffle(raffle._id)" class="btn-delete" title="Eliminar">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de sorteo -->
    <div v-if="showDrawModal" class="modal-overlay" @click="closeDrawModal">
      <div class="modal-content draw-modal" @click.stop>
        <div class="modal-header">
          <h3>Realizar Sorteo - {{ selectedRaffleForDraw?.title }}</h3>
          <button class="modal-close" @click="closeDrawModal">✕</button>
        </div>
        
        <div class="draw-type-selection">
          <label class="draw-type-option">
            <input 
              type="radio" 
              v-model="drawType" 
              value="random"
              @change="toggleDrawType"
            />
            <div class="option-content">
              <span class="option-icon">🎲</span>
              <div>
                <strong>Sorteo Aleatorio</strong>
                <p>El sistema seleccionará un ganador al azar</p>
              </div>
            </div>
          </label>
          
          <label class="draw-type-option">
            <input 
              type="radio" 
              v-model="drawType" 
              value="manual"
              @change="toggleDrawType"
            />
            <div class="option-content">
              <span class="option-icon">✋</span>
              <div>
                <strong>Sorteo Manual</strong>
                <p>Selecciona uno o más números ganadores manualmente</p>
              </div>
            </div>
          </label>
        </div>

        <div v-if="drawType === 'manual'" class="manual-draw-section">
          <div v-if="loadingTickets" class="loading">Cargando tickets...</div>
          <div v-else-if="raffleTickets.length === 0" class="empty">No hay tickets vendidos para esta rifa</div>
          <div v-else class="tickets-selection">
            <p class="selection-hint">
              Selecciona {{ selectedWinningNumbers.length }} número(s) ganador(es):
            </p>
            <div class="tickets-grid-select">
              <button
                v-for="ticket in raffleTickets"
                :key="ticket.numberString"
                @click="toggleTicketSelection(ticket.numberString)"
                class="ticket-select-btn"
                :class="{ 
                  selected: selectedWinningNumbers.includes(ticket.numberString),
                  winner: ticket.isWinner
                }"
                :disabled="ticket.isWinner"
              >
                {{ ticket.numberString }}
                <span v-if="ticket.isWinner" class="already-winner">🏆</span>
              </button>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="closeDrawModal" class="btn-secondary">Cancelar</button>
          <button 
            @click="confirmDraw" 
            class="btn-primary"
            :disabled="drawType === 'manual' && selectedWinningNumbers.length === 0"
          >
            <span>Realizar Sorteo</span>
            <span class="btn-arrow">→</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de creación/edición -->
    <div v-if="showCreateModal || editingRaffle" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>{{ editingRaffle ? 'Editar Rifa' : 'Crear Rifa' }}</h3>
        <form @submit.prevent="saveRaffle" class="raffle-form">
          <div class="form-group">
            <label>Título *</label>
            <input v-model="formData.title" type="text" required />
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="formData.description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Números máximos *</label>
            <input v-model.number="formData.maxNumbers" type="number" min="1" required />
          </div>
          <div class="form-group">
            <label>Precio por número *</label>
            <input v-model.number="formData.pricePerNumber" type="number" min="0" step="0.01" required />
          </div>
          <div class="form-group">
            <label>Fecha de sorteo</label>
            <input v-model="formData.drawDate" type="datetime-local" />
          </div>
          <div class="form-group">
            <label>Estado</label>
            <select v-model="formData.status">
              <option value="draft">Borrador</option>
              <option value="active">Activa</option>
              <option value="drawing_pending">Sorteo pendiente</option>
              <option value="finished">Finalizada</option>
            </select>
          </div>
          
          <!-- Sección de imágenes (solo al editar) -->
          <div v-if="editingRaffle" class="form-group images-section">
            <label>Imágenes de la Rifa</label>
            
            <!-- Imágenes existentes -->
            <div v-if="editingRaffle.imageUrls && editingRaffle.imageUrls.length > 0" class="existing-images">
              <div 
                v-for="(imageUrl, index) in editingRaffle.imageUrls" 
                :key="index"
                class="image-preview-item"
              >
                <img :src="imageUrl" :alt="`Imagen ${index + 1}`" />
                <button 
                  type="button" 
                  @click="removeImage(index)" 
                  class="btn-remove-image"
                  title="Eliminar imagen"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <!-- Subir nuevas imágenes -->
            <div class="upload-images">
              <input
                ref="imageInput"
                type="file"
                multiple
                accept="image/*"
                @change="handleImageSelect"
                class="image-input"
                id="raffle-images"
              />
              <label for="raffle-images" class="image-input-label">
                <span class="upload-icon">📷</span>
                <span>{{ selectedImages.length > 0 ? `${selectedImages.length} imagen(es) seleccionada(s)` : 'Seleccionar imágenes' }}</span>
              </label>
              <button
                v-if="selectedImages.length > 0"
                type="button"
                @click="uploadImages"
                class="btn-upload-images"
                :disabled="uploadingImages"
              >
                {{ uploadingImages ? 'Subiendo...' : 'Subir Imágenes' }}
              </button>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRafflesStore } from '../../store/raffles';
import { useRouter } from 'vue-router';

const rafflesStore = useRafflesStore();
const router = useRouter();

const showCreateModal = ref(false);
const editingRaffle = ref(null);
const selectedStatus = ref(null);
const selectedImages = ref([]);
const uploadingImages = ref(false);
const showDrawModal = ref(false);
const selectedRaffleForDraw = ref(null);
const drawType = ref('random'); // 'random' o 'manual'
const selectedWinningNumbers = ref([]);
const raffleTickets = ref([]);
const loadingTickets = ref(false);
const formData = reactive({
  title: '',
  description: '',
  maxNumbers: 1000,
  pricePerNumber: 0,
  drawDate: '',
  status: 'draft'
});

const statusFilters = [
  { value: null, label: 'Todas' },
  { value: 'draft', label: 'Borradores' },
  { value: 'active', label: 'Activas' },
  { value: 'drawing_pending', label: 'Sorteo Pendiente' },
  { value: 'finished', label: 'Finalizadas' }
];

const filteredRaffles = computed(() => {
  if (!selectedStatus.value) return rafflesStore.raffles;
  return rafflesStore.raffles.filter(r => r.status === selectedStatus.value);
});

const activeCount = computed(() => {
  return rafflesStore.raffles.filter(r => r.status === 'active').length;
});

const finishedCount = computed(() => {
  return rafflesStore.raffles.filter(r => r.status === 'finished').length;
});

onMounted(() => {
  rafflesStore.fetchRaffles(null, true); // true para usar ruta admin y obtener todas las rifas
});

function getStatusText(status) {
  const map = {
    draft: 'Borrador',
    active: 'Activa',
    drawing_pending: 'Sorteo pendiente',
    finished: 'Finalizada'
  };
  return map[status] || status;
}

function getRowClass(status) {
  return {
    'row-draft': status === 'draft',
    'row-active': status === 'active',
    'row-finished': status === 'finished'
  };
}

function getSoldCount(raffle) {
  return raffle.soldTicketsCount || 0;
}

function getProgressPercentage(raffle) {
  if (!raffle.maxNumbers || raffle.maxNumbers === 0) return 0;
  const sold = getSoldCount(raffle);
  return Math.min((sold / raffle.maxNumbers) * 100, 100);
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function viewDetails(raffle) {
  router.push(`/raffle/${raffle._id}`);
}

function editRaffle(raffle) {
  editingRaffle.value = { ...raffle }; // Crear copia para poder modificar
  selectedImages.value = [];
  Object.assign(formData, {
    title: raffle.title,
    description: raffle.description || '',
    maxNumbers: raffle.maxNumbers,
    pricePerNumber: raffle.pricePerNumber,
    drawDate: raffle.drawDate ? new Date(raffle.drawDate).toISOString().slice(0, 16) : '',
    status: raffle.status
  });
}

function handleImageSelect(event) {
  const files = Array.from(event.target.files);
  selectedImages.value = files;
}

async function uploadImages() {
  if (!editingRaffle.value || selectedImages.value.length === 0) return;
  
  uploadingImages.value = true;
  try {
    await rafflesStore.uploadRaffleImages(editingRaffle.value._id, selectedImages.value);
    // Actualizar las imágenes en editingRaffle
    const updatedRaffle = rafflesStore.raffles.find(r => r._id === editingRaffle.value._id);
    if (updatedRaffle) {
      editingRaffle.value.imageUrls = updatedRaffle.imageUrls;
    }
    selectedImages.value = [];
    const imageInput = document.getElementById('raffle-images');
    if (imageInput) {
      imageInput.value = '';
    }
    alert('Imágenes subidas correctamente');
  } catch (error) {
    alert('Error al subir imágenes: ' + (error.message || 'Error desconocido'));
  } finally {
    uploadingImages.value = false;
  }
}

function removeImage(index) {
  if (!editingRaffle.value || !editingRaffle.value.imageUrls) return;
  
  if (confirm('¿Eliminar esta imagen?')) {
    editingRaffle.value.imageUrls.splice(index, 1);
    // Actualizar en el backend
    rafflesStore.updateRaffle(editingRaffle.value._id, {
      imageUrls: editingRaffle.value.imageUrls
    });
  }
}

function closeModal() {
  showCreateModal.value = false;
  editingRaffle.value = null;
  selectedImages.value = [];
  Object.assign(formData, {
    title: '',
    description: '',
    maxNumbers: 1000,
    pricePerNumber: 0,
    drawDate: '',
    status: 'draft'
  });
}

async function saveRaffle() {
  try {
    const data = {
      ...formData,
      drawDate: formData.drawDate ? new Date(formData.drawDate).toISOString() : undefined
    };
    
    if (editingRaffle.value) {
      await rafflesStore.updateRaffle(editingRaffle.value._id, data);
    } else {
      await rafflesStore.createRaffle(data);
    }
    closeModal();
    rafflesStore.fetchRaffles(null, true); // Recargar todas las rifas usando ruta admin
  } catch (error) {
    console.error('Error saving raffle:', error);
  }
}

async function deleteRaffle(id) {
  if (confirm('¿Estás seguro de eliminar esta rifa?')) {
    await rafflesStore.deleteRaffle(id);
    rafflesStore.fetchRaffles(null, true); // Recargar todas las rifas usando ruta admin
  }
}

async function drawRaffle(id) {
  const raffle = rafflesStore.raffles.find(r => r._id === id);
  if (!raffle) return;
  
  // Mostrar modal para elegir tipo de sorteo
  showDrawModal.value = true;
  selectedRaffleForDraw.value = raffle;
  drawType.value = 'random';
  selectedWinningNumbers.value = [];
  raffleTickets.value = [];
  loadingTickets.value = false;
  
  // Cargar tickets si es sorteo manual
  if (drawType.value === 'manual') {
    await loadRaffleTickets(id);
  }
}

async function loadRaffleTickets(raffleId) {
  loadingTickets.value = true;
  try {
    raffleTickets.value = await rafflesStore.getRaffleTickets(raffleId);
  } catch (error) {
    alert(error.response?.data?.error || 'Error al cargar tickets');
  } finally {
    loadingTickets.value = false;
  }
}

function toggleDrawType() {
  if (drawType.value === 'manual' && raffleTickets.value.length === 0) {
    loadRaffleTickets(selectedRaffleForDraw.value._id);
  }
}

function toggleTicketSelection(ticketNumber) {
  const index = selectedWinningNumbers.value.indexOf(ticketNumber);
  if (index > -1) {
    selectedWinningNumbers.value.splice(index, 1);
  } else {
    selectedWinningNumbers.value.push(ticketNumber);
  }
}

async function confirmDraw() {
  if (!selectedRaffleForDraw.value) return;
  
  if (drawType.value === 'manual' && selectedWinningNumbers.value.length === 0) {
    alert('Debes seleccionar al menos un número ganador');
    return;
  }
  
  const confirmMessage = drawType.value === 'random' 
    ? '¿Realizar sorteo aleatorio ahora?'
    : `¿Confirmar sorteo manual con ${selectedWinningNumbers.value.length} número(s) ganador(es)?`;
  
  if (confirm(confirmMessage)) {
    try {
      const winningNumbers = drawType.value === 'manual' ? selectedWinningNumbers.value : null;
      await rafflesStore.drawRaffle(selectedRaffleForDraw.value._id, winningNumbers);
      alert('Sorteo realizado exitosamente');
      closeDrawModal();
      await rafflesStore.fetchRaffles(null, true);
    } catch (error) {
      alert(error.response?.data?.error || 'Error al realizar el sorteo');
      // Asegurar que la lista se recargue incluso si hay error
      await rafflesStore.fetchRaffles(null, true);
    }
  }
}

function closeDrawModal() {
  showDrawModal.value = false;
  selectedRaffleForDraw.value = null;
  drawType.value = 'random';
  selectedWinningNumbers.value = [];
  raffleTickets.value = [];
}
</script>

<style scoped>
.admin-raffles {
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
}

.btn-edit, .btn-draw, .btn-delete, .btn-view {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

.btn-draw:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.btn-view:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
}

.raffles-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

th {
  padding: 1.25rem 1rem;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  font-weight: 700;
  color: #495057;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

td {
  padding: 1.25rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
}

.status-badge.active {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: #fff;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.status-badge.draft {
  background: linear-gradient(135deg, #6c757d, #5a6268);
  color: #fff;
}

.status-badge.drawing_pending {
  background: linear-gradient(135deg, #ffc107, #ff9800);
  color: #333;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

.status-badge.finished {
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: #fff;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filters-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
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

.stats-summary {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat-item {
  font-weight: 700;
  color: var(--primary-color, #007bff);
  padding: 0.5rem 1rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.description-preview {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.sold-count {
  font-weight: 600;
  color: #28a745;
  display: block;
  margin-bottom: 0.25rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color, #007bff), var(--accent-color, #28a745));
  transition: width 0.5s ease;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
}

.no-date, .no-winners {
  color: #adb5bd;
  font-style: italic;
}

.winners-info {
  color: #ffc107;
  font-weight: 600;
}

.row-draft {
  background: #f8f9fa;
}

.row-active {
  background: #f0fff4;
}

.row-finished {
  background: #f0f8ff;
}

.btn-view {
  background: #17a2b8;
  color: #fff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-view:hover {
  background: #138496;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 20px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin-bottom: 1.5rem;
  color: #333;
}

.raffle-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color, #007bff);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* Estilos para la sección de imágenes */
.images-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e9ecef;
}

.existing-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.image-preview-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.image-preview-item:hover {
  transform: scale(1.05);
}

.image-preview-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.btn-remove-image {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
  transition: all 0.3s ease;
}

.btn-remove-image:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

.upload-images {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-input {
  display: none;
}

.image-input-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px dashed var(--primary-color, #007bff);
  border-radius: 12px;
  background: rgba(0, 123, 255, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  color: var(--primary-color, #007bff);
}

.image-input-label:hover {
  background: rgba(0, 123, 255, 0.1);
  border-color: var(--accent-color, #28a745);
  transform: translateY(-2px);
}

.upload-icon {
  font-size: 1.5rem;
}

.btn-upload-images {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color, #007bff), var(--accent-color, #28a745));
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.btn-upload-images:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
}

.btn-upload-images:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

/* Estilos para modal de sorteo */
.draw-modal {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  line-height: 1;
  transition: color 0.3s ease;
}

.modal-close:hover {
  color: #dc3545;
}

.draw-type-selection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.draw-type-option {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.draw-type-option:hover {
  border-color: var(--primary-color, #007bff);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
}

.draw-type-option input[type="radio"] {
  margin-right: 1rem;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.draw-type-option input[type="radio"]:checked + .option-content {
  color: var(--primary-color, #007bff);
}

.option-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.option-icon {
  font-size: 2.5rem;
}

.option-content strong {
  display: block;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.option-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.manual-draw-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e9ecef;
}

.selection-hint {
  margin-bottom: 1rem;
  color: #666;
  font-weight: 600;
}

.tickets-grid-select {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.ticket-select-btn {
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
}

.ticket-select-btn:hover:not(:disabled) {
  border-color: var(--primary-color, #007bff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
}

.ticket-select-btn.selected {
  background: linear-gradient(135deg, var(--primary-color, #007bff), var(--accent-color, #28a745));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.4);
}

.ticket-select-btn.winner {
  opacity: 0.5;
  cursor: not-allowed;
  background: #e9ecef;
}

.ticket-select-btn:disabled {
  cursor: not-allowed;
}

.already-winner {
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 1.2rem;
}

.loading, .empty {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>

