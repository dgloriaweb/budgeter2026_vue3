<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api, { setAuthToken } from '../api/api.js'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')

const errorMessage = ref('')
const successMessage = ref('')

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (password.value !== passwordConfirmation.value) {
      errorMessage.value = 'Passwords do not match.'
      return
    }

    const registerResult = await api.post('/api/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })

    if (!registerResult?.token) throw new Error('Registration did not return a token.')
    setAuthToken(registerResult.token)

    await router.push({ name: 'dashboard' })
  } catch (error) {
    errorMessage.value = error?.message || 'Registration failed.'
  }
}
</script>

<template>
  <div style="padding: 20px;">
    <h2>Register</h2>

    <form @submit.prevent="handleRegister">
      <div>
        <label for="name">Name:</label>
        <input id="name" v-model="name" type="text" required />
      </div>

      <div style="margin-top: 10px;">
        <label for="email">Email:</label>
        <input id="email" v-model="email" type="email" required />
      </div>

      <div style="margin-top: 10px;">
        <label for="password">Password:</label>
        <input id="password" v-model="password" type="password" required />
      </div>

      <div style="margin-top: 10px;">
        <label for="passwordConfirmation">Confirm Password:</label>
        <input
          id="passwordConfirmation"
          v-model="passwordConfirmation"
          type="password"
          required
        />
      </div>

      <button type="submit" style="margin-top: 10px;">Sign Up</button>
    </form>

    <p style="margin-top: 15px;">
      Already have an account?
      <RouterLink to="/">Sign In</RouterLink>
    </p>

    <p v-if="errorMessage" style="color: red; margin-top: 10px;">{{ errorMessage }}</p>
    <p v-if="successMessage" style="color: green; margin-top: 10px;">{{ successMessage }}</p>
  </div>
</template>

