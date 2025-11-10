<template>
  <div class="admin-layout">
    <header class="app-header">
      <div class="app-header-content">
        <div class="app-header-title">
          <div class="app-header-title-icon">⚙️</div>
          <h1 class="app-header-title-text">Panel de Administración</h1>
        </div>
      </div>
      <nav class="app-header-nav">
        <button @click="handleLogout" class="app-header-nav-link logout-btn-admin">
          <span class="app-header-nav-icon">🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </nav>
    </header>
    <div class="admin-container">
      <AdminNav />
      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import AdminNav from '../../components/AdminNav.vue';

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #f5f5f5;
}

/* Header styles moved to global styles.css */

.logout-btn-admin {
  background: linear-gradient(135deg, #dc3545, #c82333) !important;
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3) !important;
}

.logout-btn-admin:hover {
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4) !important;
}

.admin-container {
  display: flex;
  flex-direction: column;
  max-width: 1400px;
  margin: 0 auto;
}

.admin-content {
  flex: 1;
  padding: 1rem;
  width: 100%;
}

@media (min-width: 768px) {
  .admin-container {
    flex-direction: row;
  }
  
  .admin-content {
    padding: 2rem;
  }
}
</style>

