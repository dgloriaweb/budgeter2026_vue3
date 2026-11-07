<template>
  <div>
    <div>{{ title }}</div>
    <label v-for="option in options" :key="option.value">
      <input v-model="selectedValues" type="checkbox" :value="option.value" />
      {{ option.label }}
    </label>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  options: { type: Array, required: true },
  modelValue: { type: Array, required: true },
})

const emit = defineEmits(['update:modelValue'])

const selectedValues = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>
