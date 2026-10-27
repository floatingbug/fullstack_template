<script setup>
import { useI18n } from 'vue-i18n'

import { Button } from '@/shared/components'

const emit = defineEmits(['authButton:action'])
const { t } = useI18n()

function onAuthButtonPress(action) {
  emit('authButton:action', { action })
}
</script>

<template>
  <div class="auth-buttons">
    <Button :label="t('auth.signIn')" severity="secondary" @click="onAuthButtonPress('signIn')" />
    <Button :label="t('auth.signUp')" @click="onAuthButtonPress('signUp')" />
  </div>
</template>

<style scoped>
.auth-buttons {
  display: flex;
  gap: var(--space-md);
}
</style>
