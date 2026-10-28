<script setup>
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['logo:press'])
const { t } = useI18n()
</script>

<template>
  <button class="logo" type="button" @click="emit('logo:press')">
    {{ t('app.name') }}
  </button>
</template>

<style scoped>
.logo {
  padding: 0;
  border: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text);
  background: transparent;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-standard);
}

.logo:hover {
  color: var(--color-primary);
}
</style>
