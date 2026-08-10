<script setup>
import { ref } from 'vue';
import api, { getCsrfCookie } from './api/api.js';

const email = ref('');
const password = ref('');
const errorMessage = ref('');

const handleLogin = async () => {
  errorMessage.value = '';
  try {
    // 1. Request CSRF cookie from Laravel
    await getCsrfCookie();

    // 2. Submit login request via fetch
    await api.post('/login', {
      email: email.value,
      password: password.value,
    });

    // 3. Get authenticated user
    const user = await api.get('/api/user');
    console.log('Logged in user:', user);

  } catch (error) {
    errorMessage.value = error.message;
    console.error('Login error:', error);
  }
};
</script>

<template>
  <div class="login-container">
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

      <div>
        <label for="password">Password:</label>
        <input 
          id="password" 
          v-model="password" 
          type="password" 
          required 
        />
      </div>

      <button type="submit">Sign In</button>
    </form>

    <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
    <div v-if="currentUser" style="color: green;">
      <p>Successfully logged in as: {{ currentUser.name }} ({{ currentUser.email }})</p>
    </div>
  </div>
</template>