<script setup>
import { useRouter } from 'vue-router'

import { Logo, Topbar, Footer } from '@/shared/components'
import { useAuthStore } from '@/features/auth/store/authStore.js'
import { AuthButtons } from './components'

const router = useRouter()
const authStore = useAuthStore()

const routes = {
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
}

async function onAuthButtonActions({ action }) {
  if (action === 'signOut') {
    await authStore.signOut()
    await router.push('/')
    return
  }

  const path = routes[action]

  if (path) {
    router.push(path)
  }
}
</script>

<template>
  <div class="topbar-container">
    <header>
      <Topbar>
        <template #start>
          <div class="nav-primary">
            <Logo @logo:press="router.push('/')" />
          </div>
        </template>

        <template #end>
          <AuthButtons
            :is-authenticated="authStore.isAuthenticated"
            :user-name="authStore.user?.name ?? ''"
            @authButton:action="onAuthButtonActions"
          />
        </template>
      </Topbar>
    </header>

    <main>
      <RouterView />
    </main>

    <footer>
      <Footer />
    </footer>
  </div>
</template>

<style scoped>
.topbar-container {
  min-height: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr;
}

header {
  min-height: var(--topbar-height);
}

footer {
  min-height: var(--footer-height);
}

.nav-primary {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: var(--space-md);
}
</style>
