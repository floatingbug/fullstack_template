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
  max-width: 960px;
  padding: var(--space-xl) var(--space-lg);
}
</style>
