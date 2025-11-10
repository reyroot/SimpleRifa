<template>
  <div class="admin-login">
    <div class="login-container modern-card">
      <div class="login-header">
        <div class="login-icon">🔐</div>
        <h1 class="app-header-page-title">Acceso de Administrador</h1>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Token de Administrador</label>
          <input
            v-model="token"
            type="password"
            required
            placeholder="Ingresa el token"
            class="modern-input token-input"
          />
        </div>
        <div v-if="error" class="error-modern">{{ error }}</div>
        <button type="submit" class="btn-primary" :disabled="loading">
          <span>{{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}</span>
          <span v-if="!loading" class="btn-arrow">→</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();

const token = ref('');
const loading = ref(false);
const error = ref(null);

async function handleLogin() {
  if (!token.value) return;
  
  loading.value = true;
  error.value = null;
  
  const result = await authStore.login(token.value);
  
  if (result.success) {
    router.push('/admin');
  } else {
    error.value = result.error;
  }
  
  loading.value = false;
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color, #007bff) 0%, var(--accent-color, #28a745) 100%);
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 450px;
  padding: 2rem;
}

@media (min-width: 768px) {
  .admin-login {
    padding: 2rem;
  }
  
  .login-container {
    padding: 3rem;
  }
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.login-icon {
  font-size: 3rem;
  animation: bounce 2s infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

@media (min-width: 768px) {
  .login-icon {
    font-size: 4rem;
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.token-input {
  width: 100%;
}

.error-modern {
  color: #dc3545;
  padding: 1rem;
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  border: 2px solid #dc3545;
}

.btn-arrow {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.btn-primary:hover .btn-arrow {
  transform: translateX(4px);
}
</style>

