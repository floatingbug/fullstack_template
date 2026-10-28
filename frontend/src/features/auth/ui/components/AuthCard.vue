<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  error: { type: String, default: '' },
  notice: { type: String, default: '' },
})
</script>

<template>
  <section class="auth-card">
    <header class="auth-card__header">
      <h1>{{ title }}</h1>
      <p v-if="description" class="auth-card__description">{{ description }}</p>
    </header>

    <p v-if="error" class="alert alert--error" role="alert">{{ error }}</p>
    <p v-if="notice" class="alert alert--notice" role="status">{{ notice }}</p>

    <slot />
  </section>
</template>

<style scoped>
.auth-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  width: 100%;
  padding: var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background-color: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.auth-card__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.auth-card__header h1 {
  margin: 0;
  font-size: var(--font-size-xl);
}

.auth-card__description {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}

.alert {
  margin: 0;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.alert--error {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background-color: color-mix(in srgb, var(--color-danger) 8%, transparent);
}

.alert--notice {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
}

@media (max-width: 480px) {
  .auth-card {
    padding: var(--space-md);
  }
}
</style>
