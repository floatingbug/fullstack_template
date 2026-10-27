<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  severity: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger'].includes(value),
  },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
})

const classes = computed(() => ['button', `button--${props.severity}`])
</script>

<template>
  <button :type="type" :class="classes" :disabled="disabled">
    {{ label }}
  </button>
</template>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    opacity 120ms ease;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.button--primary {
  color: var(--color-primary-contrast);
  background-color: var(--color-primary);
}

.button--secondary {
  color: var(--color-text);
  background-color: var(--color-bg);
  border-color: var(--color-border);
}

.button--danger {
  color: var(--color-primary-contrast);
  background-color: var(--color-danger);
}
</style>
