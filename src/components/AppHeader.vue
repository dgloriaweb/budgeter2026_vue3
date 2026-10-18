<template>
  <header class="appHeader">
    <div class="logo"><img src="/images/logo.svg" alt="Budgeter" /></div>

    <div class="right">
      <RouterLink v-if="!isAuthed" class="loginLink" to="/login">Log in</RouterLink>

      <div v-else class="headerMenus">
        <div class="navMenu" data-nav-menu>
          <button type="button" class="iconButton" aria-label="Menu" @click="navOpen = !navOpen">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M4 6.5h16M4 12h16M4 17.5h16"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <div v-if="navOpen" class="menu" role="menu">
            <RouterLink
              v-for="item in navMenu"
              :key="item.to"
              class="menuLink"
              role="menuitem"
              :to="item.to"
            >
              {{ item.label }}
            </RouterLink>
          </div>
        </div>

        <div class="userMenu" data-user-menu>
          <button
            type="button"
            class="iconButton"
            aria-label="User menu"
            @click="menuOpen = !menuOpen"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Zm0 2c-4.418 0-8 3.134-8 7v1h16v-1c0-3.866-3.582-7-8-7Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <div v-if="menuOpen" class="menu" role="menu">
            <div class="menuTop" v-if="currentUser">
              <div class="menuName">{{ currentUser.name }}</div>
              <div class="menuEmail">{{ currentUser.email }}</div>
            </div>
            <button type="button" class="menuItem" role="menuitem" @click="handleLogout">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import navMenu from '@/stores/json/navMenu.json'

// Auth state is owned by App.vue; this component only renders it.
const props = defineProps({
  isAuthed: { type: Boolean, default: false },
  currentUser: { type: Object, default: null },
})

// Logout needs to resync auth + navigate, so the parent handles it.
const emit = defineEmits(['logout'])

const menuOpen = ref(false)
const navOpen = ref(false)

// Close any open menu when clicking outside this header.
const onDocClick = (event) => {
  const target = event.target
  if (!(target instanceof HTMLElement)) return
  if (target.closest('[data-user-menu]')) return
  if (target.closest('[data-nav-menu]')) return
  menuOpen.value = false
  navOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})

function handleLogout() {
  emit('logout')
}
</script>
