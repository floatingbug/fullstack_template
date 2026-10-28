import { createApp } from 'vue'

import App from './App.vue'
import router from './app/router'
import i18n from './app/i18n'
import { pinia } from './app/pinia'
import { initTheme } from './shared/theme/theme.js'
import '@/shared/styles/index.css'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)

initTheme()

app.mount('#app')
