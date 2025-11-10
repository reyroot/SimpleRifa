<template>
  <div class="home">
    <header class="app-header">
      <div class="app-header-content">
        <div v-if="getLogoUrl()" class="app-header-logo">
          <img :src="getLogoUrl()" alt="Logo" />
        </div>
        <div class="app-header-title">
          <div class="app-header-title-icon">🎲</div>
          <h1 class="app-header-title-text">{{ configStore.config.platformName || 'Sistema de Rifas' }}</h1>
        </div>
      </div>
      <nav class="app-header-nav">
        <router-link to="/my-tickets" class="app-header-nav-link">
          <span class="app-header-nav-icon">🎫</span>
          <span>Mis Tickets</span>
        </router-link>
      </nav>
    </header>

    <main class="main-content">
      <!-- Top Compradores -->
      <div v-if="topBuyers.length > 0" class="top-buyers-section modern-card">
        <div class="section-header">
          <h2>🏆 Top Compradores</h2>
          <p class="section-subtitle">Las personas que más han participado</p>
        </div>
        <div class="buyers-list">
          <div
            v-for="(buyer, index) in topBuyers"
            :key="buyer.email"
            class="buyer-item"
          >
            <span class="buyer-rank">#{{ index + 1 }}</span>
            <div class="buyer-info">
              <span class="buyer-name">{{ buyer.name || 'Comprador' }}</span>
              <span class="buyer-email">{{ buyer.maskedEmail }}</span>
            </div>
            <span class="buyer-tickets">{{ buyer.totalTickets }} tickets</span>
          </div>
        </div>
      </div>

      <div v-if="rafflesStore.loading" class="loading">Cargando rifas...</div>
      <div v-else-if="rafflesStore.error" class="error">{{ rafflesStore.error }}</div>
      <div v-else-if="rafflesStore.raffles.length === 0" class="empty">
        No hay rifas activas en este momento
      </div>
      <div v-else class="carousel-container">
        <div class="carousel-wrapper">
          <div 
            class="carousel-track" 
            :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
          >
            <div 
              v-for="raffle in rafflesStore.raffles" 
              :key="raffle._id"
              class="carousel-slide"
            >
              <RaffleCard :raffle="raffle" />
            </div>
          </div>
        </div>
        
        <!-- Controles del carrusel -->
        <div v-if="rafflesStore.raffles.length > 1" class="carousel-controls">
          <button 
            @click="previousSlide" 
            class="carousel-btn prev"
            :disabled="currentIndex === 0"
          >
            ‹
          </button>
          <div class="carousel-dots">
            <button
              v-for="(raffle, index) in rafflesStore.raffles"
              :key="raffle._id"
              @click="goToSlide(index)"
              class="dot"
              :class="{ active: currentIndex === index }"
              :aria-label="`Ir a rifa ${index + 1}`"
            ></button>
          </div>
          <button 
            @click="nextSlide" 
            class="carousel-btn next"
            :disabled="currentIndex === rafflesStore.raffles.length - 1"
          >
            ›
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRafflesStore } from '../store/raffles';
import { useConfigStore } from '../store/config';
import RaffleCard from '../components/RaffleCard.vue';
import api from '../services/api';

const rafflesStore = useRafflesStore();
const configStore = useConfigStore();
const currentIndex = ref(0);
const topBuyers = ref([]);
let autoPlayInterval = null;

onMounted(async () => {
  rafflesStore.fetchRaffles('active');
  await fetchTopBuyers();
  startAutoPlay();
});

async function fetchTopBuyers() {
  try {
    const response = await api.get('/stats/top-buyers');
    topBuyers.value = response.data;
  } catch (err) {
    console.error('Error al cargar top compradores:', err);
  }
}

function getLogoUrl() {
  if (configStore.config.logoFile) {
    return `/uploads/${configStore.config.logoFile}`;
  }
  return configStore.config.logoUrl || '';
}

onUnmounted(() => {
  stopAutoPlay();
});

function nextSlide() {
  if (currentIndex.value < rafflesStore.raffles.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0; // Volver al inicio
  }
  resetAutoPlay();
}

function previousSlide() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = rafflesStore.raffles.length - 1; // Ir al final
  }
  resetAutoPlay();
}

function goToSlide(index) {
  currentIndex.value = index;
  resetAutoPlay();
}

function startAutoPlay() {
  if (rafflesStore.raffles.length > 1) {
    autoPlayInterval = setInterval(() => {
      nextSlide();
    }, 5000); // Cambiar cada 5 segundos
  }
}

function stopAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
}

function resetAutoPlay() {
  stopAutoPlay();
  startAutoPlay();
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #f5f5f5;
}

/* Header styles moved to global styles.css */

.main-content {
  max-width: 1200px;
  margin: 1rem auto;
  padding: 0 1rem;
}

/* Mobile First */
@media (min-width: 768px) {
  .main-content {
    margin: 2rem auto;
  }
}

.loading, .error, .empty {
  text-align: center;
  padding: 3rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.error {
  color: #dc3545;
}

.carousel-container {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 0;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.carousel-track {
  display: flex;
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
}

.carousel-slide {
  min-width: 100%;
  flex-shrink: 0;
  padding: 0.5rem;
}

.carousel-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.carousel-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--primary-color, #007bff);
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

/* Mobile First - Responsive */
@media (min-width: 768px) {
  .carousel-container {
    padding: 2rem 0;
  }
  
  .carousel-wrapper {
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  .carousel-slide {
    padding: 1rem;
  }
  
  .carousel-controls {
    gap: 1.5rem;
    margin-top: 2rem;
  }
  
  .carousel-btn {
    width: 50px;
    height: 50px;
    font-size: 2rem;
  }
}

.carousel-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
}

.carousel-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.carousel-dots {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--primary-color, #007bff);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.dot:hover {
  transform: scale(1.2);
}

.dot.active {
  background: var(--primary-color, #007bff);
  width: 16px;
  height: 16px;
}
</style>

