<template>
  <nav class="admin-nav-modern">
    <router-link to="/admin" class="admin-nav-item" active-class="active" exact-active-class="active">
      <span class="nav-icon">📊</span>
      <span>Dashboard</span>
    </router-link>
    <router-link to="/admin/raffles" class="admin-nav-item" active-class="active">
      <span class="nav-icon">🎲</span>
      <span>Rifas</span>
    </router-link>
    <router-link to="/admin/orders" class="admin-nav-item" active-class="active">
      <span class="nav-icon">📦</span>
      <span>Pedidos</span>
    </router-link>
    <router-link to="/admin/payment-methods" class="admin-nav-item" active-class="active">
      <span class="nav-icon">💳</span>
      <span>Métodos de Pago</span>
    </router-link>
    <router-link to="/admin/winners" class="admin-nav-item" active-class="active">
      <span class="nav-icon">🏆</span>
      <span>Ganadores</span>
    </router-link>
    <router-link to="/admin/config" class="admin-nav-item" active-class="active">
      <span class="nav-icon">⚙️</span>
      <span>Configuración</span>
    </router-link>
  </nav>
</template>

<script setup>
</script>

<style scoped>
.admin-nav-modern {
  width: 100%;
  background: linear-gradient(180deg, #fff 0%, #f8f9fa 100%);
  padding: 1rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-bottom: 3px solid transparent;
  border-image: linear-gradient(90deg, var(--primary-color, #007bff), var(--accent-color, #28a745)) 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (min-width: 768px) {
  .admin-nav-modern {
    width: 280px;
    flex-direction: column;
    flex-wrap: nowrap;
    padding: 2rem 0;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.08);
    min-height: calc(100vh - 100px);
    border-right: 3px solid transparent;
    border-bottom: none;
    border-image: linear-gradient(180deg, var(--primary-color, #007bff), var(--accent-color, #28a745)) 1;
    overflow-x: visible;
  }
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  color: #333;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  margin: 0.25rem 0.5rem;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  font-size: 0.9rem;
}

@media (min-width: 768px) {
  .admin-nav-item {
    gap: 1rem;
    padding: 1.25rem 2rem;
    margin: 0.5rem 1rem;
    font-size: 1rem;
  }
}

.admin-nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: var(--primary-color, #007bff);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.admin-nav-item:hover {
  background: linear-gradient(135deg, rgba(0, 123, 255, 0.05) 0%, rgba(40, 167, 69, 0.05) 100%);
  transform: translateX(4px);
}

.admin-nav-item.active {
  background: linear-gradient(135deg, var(--primary-color, #007bff), var(--accent-color, #28a745));
  color: #fff;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.admin-nav-item.active::before {
  transform: scaleY(1);
}

.nav-icon {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.admin-nav-item:hover .nav-icon {
  transform: scale(1.1) rotate(5deg);
}
</style>

