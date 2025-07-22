<template>
  <div class="slider-container">
    <span class="material-symbols-outlined"> square </span>
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
  modelValue: { type: Number, default: 8 },
  min: { type: Number, default: 2 },
  max: { type: Number, default: 30 },
});

defineEmits(["update:modelValue"]);
</script>

<style scoped>

</style>
