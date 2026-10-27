import { createApp } from 'vue'

import App from './App.vue'
import router from './app/router'
import i18n from './app/i18n'
import { pinia } from './app/pinia'
import '@/shared/styles/global.scss'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app')
