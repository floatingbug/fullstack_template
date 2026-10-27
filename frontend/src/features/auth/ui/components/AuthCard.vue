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
}

.auth-card__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.auth-card__header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.auth-card__description {
  margin: 0;
  color: var(--color-text-muted);
}

.alert {
  margin: 0;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.alert--error {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.alert--notice {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
