<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <main class="home-view">
    <h1>{{ t('home.title') }}</h1>
    <p>{{ t('home.description') }}</p>
  </main>
</template>

<style scoped>
.home-view {
  width: 100%;
  max-width: var(--content-max-width);
  padding: var(--space-2xl) var(--space-lg);
}

.home-view h1 {
  margin-bottom: var(--space-sm);
}

.home-view p {
  max-width: 60ch;
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
}

@media (max-width: 480px) {
  .home-view {
    padding: var(--space-xl) var(--space-md);
  }
}
</style>
