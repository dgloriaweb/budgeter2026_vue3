<template>
    <div style="padding: 20px;">
      <h2>{{ isRegistering ? 'Register' : 'Login' }}</h2>
  
      <!-- REGISTRATION FORM -->
      <form v-if="isRegistering" @submit.prevent="handleRegister">
        <div>
          <label>Name: </label>
          <input v-model="name" type="text" required />
        </div>
        <div>
          <label>Email: </label>
          <input v-model="email" type="email" required />
        </div>
        <div>
          <label>Password: </label>
          <input v-model="password" type="password" required />
        </div>
        <div>
          <label>Confirm Password: </label>
          <input v-model="passwordConfirmation" type="password" required />
        </div>
        <button type="submit" style="margin-top: 10px;">Sign Up</button>
      </form>
  
      <!-- LOGIN FORM -->
      <form v-else @submit.prevent="handleLogin">
        <div>
          <label>Email: </label>
          <input v-model="email" type="email" required />
        </div>
        <div>
          <label>Password: </label>
          <input v-model="password" type="password" required />
        </div>
        <button type="submit" style="margin-top: 10px;">Sign In</button>
      </form>
  
      <!-- TOGGLE LINK -->
      <p style="margin-top: 15px;">
        <span v-if="isRegistering">
          Already have an account? 
          <button type="button" @click="isRegistering = false">Sign In</button>
        </span>
        <span v-else>
          Don't have an account? 
          <button type="button" @click="isRegistering = true">Register Here</button>
        </span>
      </p>
  
      <!-- STATUS MESSAGES -->
      <p v-if="errorMessage" style="color: red; margin-top: 10px;">{{ errorMessage }}</p>
      <p v-if="successMessage" style="color: green; margin-top: 10px;">{{ successMessage }}</p>
    </div>
  </template>