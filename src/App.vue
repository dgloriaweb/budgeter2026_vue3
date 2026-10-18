<template>
  <div class="appShell">
    <AppHeader :is-authed="isAuthed" :current-user="currentUser" @logout="handleLogout" />

    <main class="appMain">
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { clearAuthToken, hasAuthToken } from '@/api/api.js'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const route = useRoute()
const router = useRouter()

const isAuthed = ref(false)
const currentUser = ref(null)

const syncAuth = async () => {
  isAuthed.value = hasAuthToken()
  if (!isAuthed.value) {
    currentUser.value = null
    return
  }

  try {
    currentUser.value = await api.get('/api/user')
  } catch {
    // Token might be invalid/expired; api.js clears token on 401.
    isAuthed.value = hasAuthToken()
    if (!isAuthed.value) currentUser.value = null
  }
}

watch(
  () => route.fullPath,
  () => {
    // Route changes (login/register redirects) are a good time to resync auth state.
    syncAuth()
  },
)

onMounted(() => {
  syncAuth()
})

const handleLogout = async () => {
  try {
    await api.post('/api/logout')
  } catch {
    // ignore; we still clear local token
  } finally {
    clearAuthToken()
    await syncAuth()
    await router.push({ name: 'login' })
  }
}
</script>
