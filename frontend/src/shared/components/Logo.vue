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
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text);
  background: transparent;
  cursor: pointer;
}
</style>
