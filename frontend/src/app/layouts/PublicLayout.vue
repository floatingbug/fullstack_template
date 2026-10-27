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

<style scoped lang="scss">
@use '@/shared/styles/media' as media;
@use '@/shared/styles/breakpoints' as bp;

.topbar-container {
  min-height: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr;
}

header {
  height: var(--topbar-height);
}

footer {
  height: var(--footer-height);
}

.nav-primary {
  display: flex;
  align-items: center;

  @include media.up(bp.$bp-md) {
    flex-direction: row-reverse;
    gap: var(--space-md);
  }
}
</style>
