<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { Button } from '@/shared/components'

const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <section class="not-found">
    <h1>{{ t('notFound.title') }}</h1>
    <p>{{ t('notFound.text') }}</p>
    <Button :label="t('notFound.home')" @click="router.push('/')" />
  </section>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-xl) var(--space-md);
  text-align: center;
}

.not-found h1 {
  margin: 0;
  font-size: 2rem;
}

.not-found p {
  margin: 0;
  color: var(--color-text-muted);
}
</style>
