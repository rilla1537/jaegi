<template>
  <div class="slider-container">
    <span class="material-symbols-outlined"> eraser_size_1 </span>
    <input
      type="range"
      :min="min"
      :max="max"
      :value="modelValue"
      @input="$emit('update:modelValue', Number($event.target.value))"
      class="slider"
    />
    <!-- <span class="value-display">{{ modelValue }}px</span> -->
  </div>
</template>

<script setup>
import './slider-option.css'

defineProps({
  modelValue: { type: Number, default: 2 },
  min: { type: Number, default: 1 },
  max: { type: Number, default: 20 },
});

defineEmits(["update:modelValue"]);
</script>

<style scoped>
</style>
