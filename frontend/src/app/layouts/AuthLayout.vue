<script setup>
import { useRouter } from 'vue-router'

import { Logo } from '@/shared/components'

const router = useRouter()
</script>

<template>
  <div class="auth-layout">
    <div class="logo-container">
      <Logo @logo:press="router.push('/')" />
    </div>

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
  justify-content: center;
}

.logo-container {
  margin-bottom: var(--space-lg);
}

.auth-container {
  width: 100%;
  max-width: 420px;
  padding: var(--space-lg);
}
</style>
