<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps({
  userName: { type: String, default: '' },
  userEmail: { type: String, default: '' },
})

const emit = defineEmits(['signOut'])
const { t } = useI18n()
const open = ref(false)

function onSignOut() {
  open.value = false
  emit('signOut')
}
</script>

<template>
  <div class="user-menu">
    <button
      class="user-menu-button"
      type="button"
      :aria-label="t('user.menu')"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="user-menu-label">{{ userName || t('user.menu') }}</span>
    </button>

    <div v-if="open" class="user-menu-dropdown" role="menu">
      <p v-if="userEmail" class="user-menu-email">{{ userEmail }}</p>
      <button class="user-menu-signout" type="button" role="menuitem" @click="onSignOut">
        {{ t('user.signOut') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.user-menu {
  position: relative;
}

.user-menu-button {
  display: inline-flex;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard);
}

.user-menu-button:hover {
  background-color: var(--color-bg-muted);
  border-color: var(--color-border-strong);
}

.user-menu-label {
  font-size: var(--font-size-sm);
}

.user-menu-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + var(--space-xs));
  z-index: var(--z-dropdown);
  min-width: 12rem;
  padding: var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface-raised);
  box-shadow: var(--shadow-md);
}

.user-menu-email {
  margin: 0 0 var(--space-sm);
  padding: 0 var(--space-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  overflow-wrap: anywhere;
}

.user-menu-signout {
  width: 100%;
  padding: var(--space-xs) var(--space-sm);
  border: 0;
  border-radius: var(--radius-sm);
  background-color: transparent;
  color: var(--color-danger);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.user-menu-signout:hover {
  background-color: color-mix(in srgb, var(--color-danger) 10%, transparent);
}
</style>
