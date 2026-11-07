import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@/styles/app.css?v=1'
import '@/styles/menu.css?v=1'

import App from '@/App.vue'
import router from '@/router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
