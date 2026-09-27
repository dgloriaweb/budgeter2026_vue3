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

    await router.push({ name: 'main' })
  } catch (error) {
    errorMessage.value = error?.message || 'Registration failed.'
  }
}
</script>

<template>
  <div class="authPage">
    <h2 class="authTitle">Register</h2>

    <form @submit.prevent="handleRegister">
      <div>
        <label for="name">Name:</label>
        <input id="name" v-model="name" type="text" required class="input" />
      </div>

      <div class="authStack">
        <label for="email">Email:</label>
        <input id="email" v-model="email" type="email" required class="input" />
      </div>

      <div class="authStack">
        <label for="password">Password:</label>
        <input id="password" v-model="password" type="password" required class="input" />
      </div>

      <div class="authStack">
        <label for="passwordConfirmation">Confirm Password:</label>
        <input
          id="passwordConfirmation"
          v-model="passwordConfirmation"
          type="password"
          required
          class="input"
        />
      </div>

      <button type="submit" class="btn" style="margin-top: 10px;">Sign Up</button>
    </form>

    <p class="authActions">
      Already have an account?
      <RouterLink to="/">Sign In</RouterLink>
    </p>

    <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="message success">{{ successMessage }}</p>
  </div>
</template>

