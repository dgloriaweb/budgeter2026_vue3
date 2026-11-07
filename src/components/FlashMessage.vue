<template>
  <Teleport to="body">
    <div
      v-if="message"
      class="flashMessage"
      :class="`flashMessage--${type}`"
      role="status"
      aria-live="polite"
    >
      {{ message }}
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const type = ref('info')
const message = ref('')
let dismissTimer

function showMessage(event) {
  type.value = event.detail.type
  message.value = event.detail.message
  clearTimeout(dismissTimer)
  dismissTimer = setTimeout(() => {
    message.value = ''
  }, 2000)
}

onMounted(() => {
  window.addEventListener('app:flash', showMessage)
})

onUnmounted(() => {
  window.removeEventListener('app:flash', showMessage)
  clearTimeout(dismissTimer)
})
</script>

<style scoped>
.flashMessage {
  position: fixed;
  top: 56px;
  left: 0;
  z-index: 1000;
  box-sizing: border-box;
  width: 100%;
  padding: 14px 16px;
  text-align: center;
  font-weight: 700;
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
}

.flashMessage--error {
  background: rgb(254 226 226 / 90%);
  color: #7f1d1d;
}

.flashMessage--info {
  background: rgb(254 243 199 / 90%);
  color: #713f12;
}

.flashMessage--success {
  background: rgb(220 252 231 / 90%);
  color: #14532d;
}
</style>
