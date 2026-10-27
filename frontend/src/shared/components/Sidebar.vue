<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  label: { type: String, default: 'nav.main' },
})

const { t } = useI18n()
</script>

<template>
  <aside class="sidebar">
    <nav class="sidebar-nav" :aria-label="t(label)">
      <slot />
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  padding: var(--space-md);
  background-color: var(--color-bg-muted);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
</style>
