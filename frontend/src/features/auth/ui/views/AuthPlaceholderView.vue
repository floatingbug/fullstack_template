<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section class="auth-placeholder">
    <h1>{{ t('auth.placeholderTitle') }}</h1>
    <p>{{ t('auth.placeholderText') }}</p>
  </section>
</template>

<style scoped>
.auth-placeholder h1 {
  font-size: 1.5rem;
}
</style>
