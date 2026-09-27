import { createRouter, createWebHistory } from 'vue-router'
import { hasAuthToken } from '../api/api.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      alias: ['/main'],
      component: () => import('../view/MainView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../view/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../view/RegisterView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../view/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: () => import('../view/ExpensesView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const isAuthed = hasAuthToken()

  if (to.meta?.requiresAuth && !isAuthed) {
    return { name: 'login' }
  }

  if ((to.name === 'login' || to.name === 'register') && isAuthed) {
    return { name: 'main' }
  }
})

export default router
