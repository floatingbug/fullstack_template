<script setup>
import { useI18n } from 'vue-i18n'

import { Button } from '@/shared/components'

defineProps({
  isAuthenticated: { type: Boolean, default: false },
  userName: { type: String, default: '' },
})

const emit = defineEmits(['authButton:action'])
const { t } = useI18n()

function onAction(action) {
  emit('authButton:action', { action })
}
</script>

<template>
  <div class="auth-buttons">
    <template v-if="isAuthenticated">
      <span class="auth-user">{{ userName }}</span>
      <Button :label="t('auth.signOut')" severity="secondary" @click="onAction('signOut')" />
    </template>

    <template v-else>
      <Button :label="t('auth.signIn')" severity="secondary" @click="onAction('signIn')" />
      <Button :label="t('auth.signUp')" @click="onAction('signUp')" />
    </template>
  </div>
</template>

<style scoped>
.auth-buttons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-sm) var(--space-md);
}

.auth-user {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
</style>
