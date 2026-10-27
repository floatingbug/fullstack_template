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
  border-radius: var(--radius-sm);
  background-color: var(--color-bg);
  color: var(--color-text);
  cursor: pointer;
}

.user-menu-label {
  font-size: 0.875rem;
}

.user-menu-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + var(--space-xs));
  min-width: 12rem;
  padding: var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg);
  box-shadow: var(--shadow-md);
  z-index: 20;
}

.user-menu-email {
  margin: 0 0 var(--space-sm);
  padding: 0 var(--space-sm);
  font-size: 0.75rem;
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
}

.user-menu-signout:hover {
  background-color: var(--color-bg-muted);
}
</style>
