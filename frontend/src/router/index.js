import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';
import Home from '../views/Home.vue';
import RaffleDetail from '../views/RaffleDetail.vue';
import Checkout from '../views/Checkout.vue';
import MyTickets from '../views/MyTickets.vue';
import AdminLogin from '../views/AdminLogin.vue';
import AdminLayout from '../views/admin/AdminLayout.vue';
import AdminDashboard from '../views/admin/AdminDashboard.vue';
import AdminRaffles from '../views/admin/AdminRaffles.vue';
import AdminOrders from '../views/admin/AdminOrders.vue';
import AdminPaymentMethods from '../views/admin/AdminPaymentMethods.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/raffle/:id',
    name: 'RaffleDetail',
    component: RaffleDetail
  },
  {
    path: '/checkout/:raffleId',
    name: 'Checkout',
    component: Checkout
  },
  {
    path: '/my-tickets',
    name: 'MyTickets',
    component: MyTickets
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminDashboard
      },
      {
        path: 'raffles',
        name: 'AdminRaffles',
        component: AdminRaffles
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: AdminOrders
      },
      {
        path: 'payment-methods',
        name: 'AdminPaymentMethods',
        component: AdminPaymentMethods
      },
      {
        path: 'config',
        name: 'AdminConfig',
        component: () => import('../views/admin/AdminConfig.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guarda de navegación para rutas admin
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAdmin && !authStore.hasToken) {
    next('/admin/login');
  } else if (to.path === '/admin/login' && authStore.hasToken) {
    next('/admin');
  } else {
    next();
  }
});

export default router;

