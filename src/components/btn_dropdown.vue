<script setup>
import AppIcon from './AppIcon.vue'

defineOptions({ name: 'btn_dropdown' })

const props = defineProps({
  open: { type: Boolean, default: false },
  size: { type: [Number, String], default: 24 },
  strokeWidth: { type: [Number, String], default: 3 },
  ariaLabel: { type: String, default: 'Toggle details' },
  title: { type: String, default: 'Details' },
})

const emit = defineEmits(['click'])
</script>

<template>
  <button type="button" class="detailsBtn" :class="{ open: props.open }" :aria-label="props.ariaLabel" :title="props.title" @click="emit('click', $event)"><AppIcon class="detailsIcon" name="chevron-down" :size="props.size" :stroke-width="props.strokeWidth" /></button>
</template>

