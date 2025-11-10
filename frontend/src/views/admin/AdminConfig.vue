<template>
  <div class="admin-config">
    <div class="header-section">
      <h2>Configuración de la Plataforma</h2>
      <p class="subtitle">Personaliza el nombre, colores y branding de tu plataforma de rifas</p>
    </div>

    <div v-if="configStore.loading" class="loading">Cargando configuración...</div>
    <div v-else-if="configStore.error" class="error">{{ configStore.error }}</div>
    <div v-else class="config-form-container">
      <form @submit.prevent="saveConfig" class="config-form">
        <div class="form-section">
          <h3>Información General</h3>
          <div class="form-group">
            <label>Nombre de la Plataforma *</label>
            <input
              v-model="formData.platformName"
              type="text"
              required
              placeholder="Ej: Rifas del Norte"
            />
            <small>Este nombre aparecerá en el encabezado y título de la página</small>
          </div>
          <div class="form-group">
            <label>Texto del Footer</label>
            <input
              v-model="formData.footerText"
              type="text"
              placeholder="© 2024 Tu Empresa. Todos los derechos reservados."
            />
          </div>
        </div>

        <div class="form-section">
          <h3>Colores de la Plataforma</h3>
          <div class="color-grid">
            <div class="form-group">
              <label>Color Primario</label>
              <div class="color-input-group">
                <input
                  v-model="formData.primaryColor"
                  type="color"
                  class="color-picker"
                />
                <input
                  v-model="formData.primaryColor"
                  type="text"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  placeholder="#007bff"
                  class="color-text"
                />
              </div>
              <small>Color principal para botones y enlaces</small>
            </div>
            <div class="form-group">
              <label>Color Secundario</label>
              <div class="color-input-group">
                <input
                  v-model="formData.secondaryColor"
                  type="color"
                  class="color-picker"
                />
                <input
                  v-model="formData.secondaryColor"
                  type="text"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  placeholder="#6c757d"
                  class="color-text"
                />
              </div>
              <small>Color para elementos secundarios</small>
            </div>
            <div class="form-group">
              <label>Color de Acento</label>
              <div class="color-input-group">
                <input
                  v-model="formData.accentColor"
                  type="color"
                  class="color-picker"
                />
                <input
                  v-model="formData.accentColor"
                  type="text"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  placeholder="#28a745"
                  class="color-text"
                />
              </div>
              <small>Color para destacar elementos importantes</small>
            </div>
            <div class="form-group">
              <label>Color de Fondo</label>
              <div class="color-input-group">
                <input
                  v-model="formData.backgroundColor"
                  type="color"
                  class="color-picker"
                />
                <input
                  v-model="formData.backgroundColor"
                  type="text"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  placeholder="#f5f5f5"
                  class="color-text"
                />
              </div>
              <small>Color de fondo general de la aplicación</small>
            </div>
            <div class="form-group">
              <label>Color de Texto</label>
              <div class="color-input-group">
                <input
                  v-model="formData.textColor"
                  type="color"
                  class="color-picker"
                />
                <input
                  v-model="formData.textColor"
                  type="text"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  placeholder="#333333"
                  class="color-text"
                />
              </div>
              <small>Color principal del texto</small>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Branding</h3>
          <div class="form-group">
            <label>Logo de la Aplicación</label>
            <div class="logo-upload-section">
              <div v-if="formData.logoFile || formData.logoUrl" class="logo-preview">
                <img :src="getLogoPreview()" alt="Logo actual" class="logo-preview-img" />
                <button type="button" @click="removeLogo" class="btn-remove-logo">✕</button>
              </div>
              <div class="logo-upload-options">
                <div class="upload-option">
                  <label class="upload-label">
                    <input
                      ref="logoFileInput"
                      type="file"
                      accept="image/*"
                      @change="handleLogoFileSelect"
                      style="display: none"
                    />
                    <span class="upload-btn">📤 Subir Logo</span>
                    <small>Sube una imagen desde tu computadora</small>
                  </label>
                </div>
                <div class="upload-divider">o</div>
                <div class="upload-option">
                  <label>URL del Logo</label>
                  <input
                    v-model="formData.logoUrl"
                    type="url"
                    placeholder="https://ejemplo.com/logo.png"
                  />
                  <small>O ingresa una URL de imagen</small>
                </div>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>URL del Favicon</label>
            <input
              v-model="formData.faviconUrl"
              type="url"
              placeholder="https://ejemplo.com/favicon.ico"
            />
            <small>URL del favicon (icono de la pestaña del navegador)</small>
          </div>
        </div>

        <div class="form-section">
          <h3>Configuración de Moneda</h3>
          <div class="form-group">
            <label>Moneda de la Plataforma</label>
            <select v-model="formData.currency" class="modern-select">
              <option value="USD">USD (Dólares)</option>
              <option value="VES">VES (Bolívares Venezolanos)</option>
            </select>
            <small>La moneda se mostrará en todos los precios de la plataforma</small>
          </div>
        </div>

        <div class="form-section">
          <h3>Información de Contacto</h3>
          <div class="form-group">
            <label>Email de Contacto</label>
            <input
              v-model="formData.contactEmail"
              type="email"
              placeholder="contacto@ejemplo.com"
            />
          </div>
          <div class="form-group">
            <label>Teléfono de Contacto</label>
            <input
              v-model="formData.contactPhone"
              type="tel"
              placeholder="+54 11 1234-5678"
            />
          </div>
        </div>

        <div class="preview-section">
          <h3>Vista Previa</h3>
          <div class="preview-box" :style="previewStyles">
            <div class="preview-header">
              <span v-if="formData.logoUrl" class="preview-logo">
                <img :src="formData.logoUrl" alt="Logo" @error="logoError = true" v-if="!logoError" />
                <span v-else>Logo</span>
              </span>
              <h4>{{ formData.platformName || 'Nombre de la Plataforma' }}</h4>
            </div>
            <div class="preview-content">
              <button class="preview-btn-primary">Botón Primario</button>
              <button class="preview-btn-secondary">Botón Secundario</button>
              <button class="preview-btn-accent">Botón de Acento</button>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="resetForm" class="btn-secondary">Restablecer</button>
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar Configuración' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useConfigStore } from '../../store/config';
import api from '../../services/api';

const configStore = useConfigStore();
const saving = ref(false);
const logoError = ref(false);

const formData = reactive({
  platformName: '',
  primaryColor: '#007bff',
  secondaryColor: '#6c757d',
  accentColor: '#28a745',
  backgroundColor: '#f5f5f5',
  textColor: '#333333',
  logoUrl: '',
  logoFile: '',
  faviconUrl: '',
  contactEmail: '',
  contactPhone: '',
  footerText: '',
  currency: 'USD'
});

const logoFileInput = ref(null);
const uploadingLogo = ref(false);

const previewStyles = computed(() => ({
  '--preview-primary': formData.primaryColor,
  '--preview-secondary': formData.secondaryColor,
  '--preview-accent': formData.accentColor,
  '--preview-bg': formData.backgroundColor,
  '--preview-text': formData.textColor,
  backgroundColor: formData.backgroundColor,
  color: formData.textColor
}));

onMounted(() => {
  loadConfig();
});

function loadConfig() {
  if (configStore.config) {
    Object.assign(formData, configStore.config);
  }
}

watch(() => configStore.config, (newConfig) => {
  if (newConfig) {
    Object.assign(formData, newConfig);
  }
}, { deep: true });

async function saveConfig() {
  saving.value = true;
  try {
    await configStore.updateConfig(formData);
    alert('Configuración guardada exitosamente');
  } catch (error) {
    const errorMsg = error.message || configStore.error || 'Error al guardar la configuración';
    alert(`Error: ${errorMsg}`);
    console.error('Error saving config:', error);
  } finally {
    saving.value = false;
  }
}

function resetForm() {
  if (confirm('¿Restablecer a los valores guardados?')) {
    loadConfig();
  }
}

async function handleLogoFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (file.size > 5 * 1024 * 1024) {
    alert('El archivo es demasiado grande (máx. 5MB)');
    return;
  }
  
  uploadingLogo.value = true;
  try {
    const uploadFormData = new FormData();
    uploadFormData.append('logo', file);
    
    const response = await api.post('/admin/config/upload-logo', uploadFormData);
    formData.logoFile = response.data.logoFile;
    formData.logoUrl = response.data.logoUrl;
    alert('Logo subido exitosamente');
  } catch (err) {
    alert(err.response?.data?.error || 'Error al subir el logo');
  } finally {
    uploadingLogo.value = false;
    if (logoFileInput.value) {
      logoFileInput.value.value = '';
    }
  }
}

function getLogoPreview() {
  if (formData.logoFile) {
    return `/uploads/${formData.logoFile}`;
  }
  return formData.logoUrl || '';
}

function removeLogo() {
  if (confirm('¿Eliminar el logo actual?')) {
    formData.logoFile = '';
    formData.logoUrl = '';
  }
}
</script>

<style scoped>
.admin-config {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

@media (min-width: 768px) {
  .admin-config {
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
}

.header-section {
  margin-bottom: 2rem;
}

.header-section h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 0.9rem;
}

.config-form-container {
  max-width: 900px;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid var(--primary-color, #007bff);
}

.form-section h3 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="tel"],
.form-group input[type="url"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.85rem;
}

.color-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .color-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}

.color-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-picker {
  width: 60px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.color-text {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
}

.preview-section {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.preview-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.preview-box {
  padding: 2rem;
  border-radius: 8px;
  border: 2px solid #ddd;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(0,0,0,0.1);
}

.preview-logo img {
  max-height: 40px;
  max-width: 120px;
}

.preview-header h4 {
  margin: 0;
  font-size: 1.5rem;
}

.preview-content {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.preview-btn-primary {
  background: var(--preview-primary);
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.preview-btn-secondary {
  background: var(--preview-secondary);
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.preview-btn-accent {
  background: var(--preview-accent);
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.form-actions button {
  width: 100%;
}

@media (min-width: 768px) {
  .form-actions {
    flex-direction: row;
    gap: 1rem;
    justify-content: flex-end;
  }
  
  .form-actions button {
    width: auto;
  }
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  background: var(--primary-color, #007bff);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: #fff;
}

.btn-secondary:hover {
  background: #5a6268;
}
</style>

