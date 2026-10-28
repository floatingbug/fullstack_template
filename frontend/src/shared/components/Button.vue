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
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-snug);
  cursor: pointer;
  transition:
    color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.button--primary {
  color: var(--color-primary-contrast);
  background-color: var(--color-primary);
}

.button--primary:not(:disabled):hover {
  background-color: var(--color-primary-hover);
}

.button--secondary {
  color: var(--color-text);
  background-color: var(--color-surface);
  border-color: var(--color-border);
}

.button--secondary:not(:disabled):hover {
  background-color: var(--color-bg-muted);
  border-color: var(--color-border-strong);
}

.button--danger {
  color: var(--color-danger-contrast);
  background-color: var(--color-danger);
}

.button--danger:not(:disabled):hover {
  background-color: var(--color-danger-hover);
}
</style>
