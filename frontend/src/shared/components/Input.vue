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
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.input-control {
  width: 100%;
  padding: var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg);
  color: var(--color-text);
  font: inherit;
}

.input-control:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.input-control[aria-invalid='true'] {
  border-color: var(--color-danger);
}

.input-hint,
.input-error {
  margin: 0;
  font-size: 0.8125rem;
}

.input-hint {
  color: var(--color-text-muted);
}

.input-error {
  color: var(--color-danger);
}
</style>
