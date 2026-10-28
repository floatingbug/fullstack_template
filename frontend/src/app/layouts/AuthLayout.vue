<script setup>
import { useRouter } from 'vue-router'

import { Logo, ThemeToggle } from '@/shared/components'

const router = useRouter()
</script>

<template>
  <div class="auth-layout">
    <header class="auth-header">
      <Logo @logo:press="router.push('/')" />
      <ThemeToggle />
    </header>

    <div class="auth-container">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md);
}

.auth-container {
  width: 100%;
  max-width: var(--auth-card-width);
  padding: var(--space-lg);
  margin-block: auto;
}
</style>
