<template>
  <button class="upload-button" @click="triggerFileInput">
    <span class="material-symbols-outlined"> upload </span>
    <!-- <span class="button-text"></span> -->
  </button>
  <input
    type="file"
    ref="fileInput"
    @change="handleFileChange"
    accept="image/*"
    style="display: none"
  />
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["file-uploaded"]);
const fileInput = ref(null);

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    emit("file-uploaded", file);
  }
  if (event.target) {
    event.target.value = null;
  }
};
</script>

<style scoped>
.upload-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem; /* 알약 형태 */
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #d1d5db;
  cursor: pointer;
  transition: background-color 0.2s;
}

.upload-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.upload-button .material-icons-round {
  font-size: 20px;
}

.upload-button .button-text {
  font-size: 16px;
}
</style>
