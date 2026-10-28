<script setup>
const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: String, default: '' },
  type: { type: String, default: 'text' },
  autocomplete: { type: String, default: 'off' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

function onInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="input-field">
    <label :for="id" class="input-label">{{ label }}</label>
    <input
      :id="id"
      class="input-control"
      :type="type"
      :value="modelValue"
      :autocomplete="autocomplete"
      :required="required"
      :disabled="disabled"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined"
      @input="onInput"
    />
    <p v-if="hint && !error" :id="`${id}-hint`" class="input-hint">{{ hint }}</p>
    <p v-if="error" :id="`${id}-error`" class="input-error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.input-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.input-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.input-control {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text);
  transition:
    border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}

.input-control::placeholder {
  color: var(--color-text-muted);
}

.input-control:focus {
  border-color: var(--color-primary);
  outline: 2px solid var(--color-focus);
  outline-offset: 1px;
}

.input-control[aria-invalid='true'] {
  border-color: var(--color-danger);
}

.input-hint,
.input-error {
  margin: 0;
  font-size: var(--font-size-xs);
}

.input-hint {
  color: var(--color-text-muted);
}

.input-error {
  color: var(--color-danger);
}
</style>
