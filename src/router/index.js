import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      alias: ['/login'],
      component: () => import('../view/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../view/RegisterView.vue'),
    },
  ],
})

export default router
