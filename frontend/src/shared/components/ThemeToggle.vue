<script setup>
import { useI18n } from 'vue-i18n'

import { THEMES, setTheme, theme } from '@/shared/theme/theme.js'

const { t } = useI18n()
</script>

<template>
  <div class="theme-toggle" role="group" :aria-label="t('theme.label')">
    <button
      v-for="value in THEMES"
      :key="value"
      type="button"
      class="theme-toggle__button"
      :class="{ 'theme-toggle__button--active': theme === value }"
      :aria-pressed="theme === value"
      :aria-label="t(`theme.${value}`)"
      :title="t(`theme.${value}`)"
      :data-theme-value="value"
      @click="setTheme(value)"
    >
      <svg
        v-if="value === 'light'"
        class="theme-toggle__icon"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="3.25" />
        <path
          d="M10 2.25v1.5M10 16.25v1.5M2.25 10h1.5M16.25 10h1.5M4.52 4.52l1.06 1.06M14.42 14.42l1.06 1.06M15.48 4.52l-1.06 1.06M5.58 14.42l-1.06 1.06"
        />
      </svg>

      <svg
        v-else-if="value === 'dark'"
        class="theme-toggle__icon"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M16.5 12.3A6.8 6.8 0 0 1 7.7 3.5a6.8 6.8 0 1 0 8.8 8.8Z" />
      </svg>

      <svg
        v-else
        class="theme-toggle__icon"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect x="2.75" y="3.25" width="14.5" height="10.5" rx="1.5" />
        <path d="M7 16.75h6M10 13.75v3" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs);
  padding: var(--space-2xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background-color: var(--color-bg-muted);
}

.theme-toggle__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: 0;
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
  background-color: transparent;
  cursor: pointer;
  transition:
    color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}

.theme-toggle__button:hover {
  color: var(--color-text);
  background-color: var(--color-surface-raised);
}

.theme-toggle__button--active {
  color: var(--color-primary);
  background-color: var(--color-surface-raised);
  box-shadow: var(--shadow-sm);
}

.theme-toggle__icon {
  width: 1rem;
  height: 1rem;
}
</style>
