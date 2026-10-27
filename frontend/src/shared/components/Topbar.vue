<script setup>
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
      <slot name="end" />
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  height: var(--topbar-height);
  padding: 0 var(--space-md);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg);
}

.topbar-start,
.topbar-end {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.topbar-default {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}
</style>
