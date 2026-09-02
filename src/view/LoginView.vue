<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { clearAuthToken, hasAuthToken, setAuthToken } from '../api/api.js'

const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const currentUser = ref(null)

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
    await router.push({ name: 'dashboard' })
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
  <div class="login-container" style="padding: 20px;">
    <h2>Login</h2>

    <form @submit.prevent="handleLogin">
      <div>
        <label for="email">Email:</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          placeholder="email@example.com"
        />
      </div>

      <div style="margin-top: 10px;">
        <label for="password">Password:</label>
        <input id="password" v-model="password" type="password" required />
      </div>

      <button type="submit" style="margin-top: 10px;">Sign In</button>
    </form>

    <p style="margin-top: 15px;">
      Don't have an account?
      <RouterLink to="/register">Register</RouterLink>
    </p>

    <p v-if="errorMessage" style="color: red; margin-top: 10px;">{{ errorMessage }}</p>
    <p v-if="successMessage" style="color: green; margin-top: 10px;">{{ successMessage }}</p>

    <div v-if="currentUser" style="color: green; margin-top: 10px;">
      <p>Logged in as: {{ currentUser.name }} ({{ currentUser.email }})</p>
      <button type="button" style="margin-top: 10px;" @click="handleLogout">Logout</button>
    </div>
  </div>
</template>

