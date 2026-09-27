<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, {
  clearAuthToken,
  getApiTarget,
  hasAuthToken,
  setApiTarget,
  setAuthToken,
} from '../api/api.js'

const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const currentUser = ref(null)
const apiTarget = ref(getApiTarget())
const canSwitchBackend =
  import.meta.env.DEV ||
  (typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))

const toggleApiTarget = () => {
  const next = apiTarget.value === 'local' ? 'live' : 'local'
  setApiTarget(next)
  apiTarget.value = next
  currentUser.value = null
  errorMessage.value = ''
  successMessage.value =
    next === 'local' ? 'Using localhost backend.' : 'Using live backend.'
}

const loadCurrentUser = async () => {
  if (!hasAuthToken()) {
    currentUser.value = null
    return
  }
  try {
    currentUser.value = await api.get('/api/user')
  } catch {
    currentUser.value = null
  }
}

onMounted(() => {
  // On live/prod frontends, always default to live backend (ignore any stored local choice).
  if (!canSwitchBackend) {
    setApiTarget('live')
    apiTarget.value = 'live'
  }

  if (route.query?.registered === '1') {
    successMessage.value = 'Account created. Please sign in.'
    if (typeof route.query?.email === 'string') email.value = route.query.email
    router.replace({ path: '/', query: {} })
  }
  loadCurrentUser()
})

const handleLogin = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const loginResult = await api.post('/api/login', {
      email: email.value,
      password: password.value,
    })

    if (!loginResult?.token) throw new Error('Login did not return a token.')
    setAuthToken(loginResult.token)

    currentUser.value = loginResult?.user || null
    if (!currentUser.value) currentUser.value = await api.get('/api/user')
    successMessage.value = 'Logged in.'
    await router.push({ name: 'main' })
  } catch (error) {
    errorMessage.value = error?.message || 'Login failed.'
  }
}

const handleLogout = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await api.post('/api/logout')
  } catch (error) {
    // If the token is already invalid/expired, we still want to clear it locally.
    errorMessage.value = error?.message || ''
  } finally {
    clearAuthToken()
    currentUser.value = null
    successMessage.value = 'Logged out.'
  }
}
</script>

<template>
  <div class="authPage">
    <h2 class="authTitle">Login</h2>

    <form @submit.prevent="handleLogin">
      <div>
        <label for="email">Email:</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          placeholder="email@example.com"
          class="input"
        />
      </div>

      <div class="authStack">
        <label for="password">Password:</label>
        <input id="password" v-model="password" type="password" required class="input" />
      </div>

      <button type="submit" class="btn" style="margin-top: 10px;">Sign In</button>
    </form>

    <p class="authActions">
      Don't have an account?
      <RouterLink to="/register">Register</RouterLink>
    </p>

    <div v-if="canSwitchBackend" class="serverSwitch">
      <button type="button" class="btn secondary" @click="toggleApiTarget">
        Backend: {{ apiTarget === 'local' ? 'localhost' : 'live' }}
      </button>
      <span>Click to switch</span>
    </div>

    <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="message success">{{ successMessage }}</p>

    <div v-if="currentUser" class="message success">
      <p>Logged in as: {{ currentUser.name }} ({{ currentUser.email }})</p>
      <button type="button" class="btn secondary" style="margin-top: 10px;" @click="handleLogout">
        Logout
      </button>
    </div>
  </div>
</template>

