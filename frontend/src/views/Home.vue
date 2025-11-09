<template>
  <div class="home">
    <header class="app-header">
      <div class="app-header-content">
        <div v-if="configStore.config.logoUrl" class="app-header-logo">
          <img :src="configStore.config.logoUrl" alt="Logo" />
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

const rafflesStore = useRafflesStore();
const configStore = useConfigStore();
const currentIndex = ref(0);
let autoPlayInterval = null;

onMounted(() => {
  rafflesStore.fetchRaffles('active');
  startAutoPlay();
});

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
  margin: 2rem auto;
  padding: 0 1rem;
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
  padding: 2rem 0;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.carousel-track {
  display: flex;
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
}

.carousel-slide {
  min-width: 100%;
  flex-shrink: 0;
  padding: 1rem;
}

.carousel-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.carousel-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: var(--primary-color, #007bff);
  color: #fff;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
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

