<script setup>
import ThemeToggle from './ThemeToggle.vue'

defineProps({
  label: { type: String, default: '' },
})
</script>

<template>
  <header class="topbar">
    <div class="topbar-start">
      <slot name="start" />
    </div>

    <div class="topbar-default">
      <slot />
    </div>

    <div class="topbar-end">
      <ThemeToggle />
      <slot name="end" />
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-sm) var(--space-md);
  min-height: var(--topbar-height);
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.topbar-start,
.topbar-default,
.topbar-end {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  min-width: 0;
}

.topbar-end {
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-sm) var(--space-md);
}
</style>
