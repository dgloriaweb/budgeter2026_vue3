<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api, { clearAuthToken } from '../api/api.js'

const router = useRouter()

const currentUser = ref(null)
const errorMessage = ref('')
const successMessage = ref('')

const loadCurrentUser = async () => {
  errorMessage.value = ''
  try {
    currentUser.value = await api.get('/api/user')
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to load user.'
    currentUser.value = null
  }
}

onMounted(() => {
  loadCurrentUser()
})

const handleLogout = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await api.post('/api/logout')
  } catch (error) {
    errorMessage.value = error?.message || ''
  } finally {
    clearAuthToken()
    currentUser.value = null
    successMessage.value = 'Logged out.'
    await router.push({ name: 'login' })
  }
}
</script>

<template>
  <div style="padding: 20px;">
    <h2>Main</h2>

    <p v-if="errorMessage" style="color: red; margin-top: 10px;">{{ errorMessage }}</p>
    <p v-if="successMessage" style="color: green; margin-top: 10px;">{{ successMessage }}</p>

    <div v-if="currentUser" style="margin-top: 10px;">
      <p>Welcome, {{ currentUser.name }} ({{ currentUser.email }})</p>
      <button type="button" style="margin-top: 10px;" @click="handleLogout">Logout</button>
    </div>

    <div v-else style="margin-top: 10px;">
      <p>Loading…</p>
    </div>
  </div>
</template>

