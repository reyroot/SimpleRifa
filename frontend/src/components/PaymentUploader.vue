<template>
  <div class="payment-uploader">
    <div v-if="!uploaded" class="upload-area">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        style="display: none"
      />
      <div v-if="!selectedFile" class="upload-placeholder" @click="$refs.fileInput.click()">
        <p>Haz clic para seleccionar una imagen</p>
        <small>Formatos: JPG, PNG (máx. 5MB)</small>
      </div>
      <div v-else class="file-selected">
        <p>Archivo seleccionado: {{ selectedFile.name }}</p>
        <button @click="uploadFile" class="btn-primary" :disabled="uploading">
          {{ uploading ? 'Subiendo...' : 'Subir Comprobante' }}
        </button>
        <button @click="selectedFile = null" class="btn-secondary">Cancelar</button>
      </div>
    </div>
    <div v-else class="upload-success">
      <p>✅ Comprobante subido exitosamente</p>
      <img v-if="previewUrl" :src="previewUrl" alt="Comprobante" class="preview" />
    </div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useOrdersStore } from '../store/orders';

const props = defineProps({
  orderId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['uploaded']);

const ordersStore = useOrdersStore();
const selectedFile = ref(null);
const uploading = ref(false);
const uploaded = ref(false);
const previewUrl = ref(null);
const error = ref(null);

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'El archivo es demasiado grande (máx. 5MB)';
      return;
    }
    selectedFile.value = file;
    error.value = null;
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

async function uploadFile() {
  if (!selectedFile.value) return;
  
  uploading.value = true;
  error.value = null;
  
  try {
    await ordersStore.uploadProof(props.orderId, selectedFile.value);
    uploaded.value = true;
    emit('uploaded');
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al subir el archivo';
  } finally {
    uploading.value = false;
  }
}
</script>

<style scoped>
.payment-uploader {
  margin: 2rem 0;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 2rem;
  text-align: center;
}

.upload-placeholder {
  cursor: pointer;
  color: #666;
}

.upload-placeholder:hover {
  color: #007bff;
}

.file-selected {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  background: #007bff;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: #fff;
}

.upload-success {
  padding: 1rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  text-align: center;
}

.preview {
  max-width: 100%;
  max-height: 400px;
  margin-top: 1rem;
  border-radius: 4px;
}

.error {
  color: #dc3545;
  margin-top: 1rem;
  text-align: center;
}
</style>

