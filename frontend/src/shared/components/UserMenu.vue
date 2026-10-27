<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <button class="user-menu" type="button" :aria-label="t('user.menu')">
    <span class="user-menu-label">{{ t('user.menu') }}</span>
  </button>
</template>

<style scoped>
.user-menu {
  display: inline-flex;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg);
  cursor: pointer;
}

.user-menu-label {
  font-size: 0.875rem;
}
</style>
