<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { clearAuthToken, hasAuthToken } from './api/api.js'

const route = useRoute()
const router = useRouter()

const isAuthed = ref(false)
const currentUser = ref(null)
const menuOpen = ref(false)
const navOpen = ref(false)

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
    menuOpen.value = false
    navOpen.value = false
  },
)

const onDocClick = (event) => {
  const target = event.target
  if (!(target instanceof HTMLElement)) return
  if (target.closest('[data-user-menu]')) return
  if (target.closest('[data-nav-menu]')) return
  menuOpen.value = false
  navOpen.value = false
}

onMounted(() => {
  syncAuth()
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})

const handleLogout = async () => {
  try {
    await api.post('/api/logout')
  } catch {
    // ignore; we still clear local token
  } finally {
    clearAuthToken()
    await syncAuth()
    menuOpen.value = false
    navOpen.value = false
    await router.push({ name: 'login' })
  }
}
</script>

<template>
  <div class="appShell">
    <header class="appHeader">
      <div class="logo">Budget<img src="/logo.png" alt="Budgeter" /></div>

      <div class="right">
        <RouterLink v-if="!isAuthed" class="loginLink" to="/login">Log in</RouterLink>

        <div v-else class="headerMenus">
          <div class="navMenu" data-nav-menu>
            <button
              type="button"
              class="iconButton"
              aria-label="Menu"
              @click="navOpen = !navOpen"
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
                  d="M4 6.5h16M4 12h16M4 17.5h16"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>

            <div v-if="navOpen" class="menu" role="menu">
              <RouterLink class="menuLink" role="menuitem" to="/dashboard">Dashboard</RouterLink>
              <RouterLink class="menuLink" role="menuitem" to="/expenses">Expenses</RouterLink>
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

    <main class="appMain">
      <RouterView />
    </main>
  </div>
</template>
