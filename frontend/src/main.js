import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useConfigStore } from './store/config';
import './assets/styles.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Cargar configuración al iniciar y luego montar la app
(async () => {
  const configStore = useConfigStore();
  try {
    await configStore.fetchConfig();
  } catch (error) {
    console.error('Error loading config:', error);
  }
  app.mount('#app');
})();

