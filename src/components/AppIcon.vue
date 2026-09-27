<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  strokeWidth: { type: [Number, String], default: 2 },
  title: { type: String, default: '' },
})

const px = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
const sw = computed(() =>
  typeof props.strokeWidth === 'number' ? String(props.strokeWidth) : props.strokeWidth,
)
</script>

<template>
  <svg
    v-if="name === 'chevron-down'"
    :width="px"
    :height="px"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <title v-if="title">{{ title }}</title>
    <path
      d="M7 10l5 5 5-5"
      stroke="currentColor"
      :stroke-width="sw"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else-if="name === 'filter'"
    :width="px"
    :height="px"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <title v-if="title">{{ title }}</title>
    <path
      d="M4 7h10M4 17h16M14 7l2-2 2 2-2 2-2-2Zm-6 10l2-2 2 2-2 2-2-2Z"
      stroke="currentColor"
      :stroke-width="sw"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

