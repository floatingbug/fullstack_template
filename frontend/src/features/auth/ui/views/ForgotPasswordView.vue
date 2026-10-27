<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Button, Input } from '@/shared/components'

import AuthCard from '../components/AuthCard.vue'
import { getEmailErrorKey } from '../../services/authValidation.js'
import { useAuthStore } from '../../store/authStore.js'

const { t } = useI18n()
const store = useAuthStore()

const errorMessage = computed(() => (store.errorKey ? t(store.errorKey) : ''))

async function onSubmit() {
  store.clearError()

  const email = store.forgotForm.email.trim()

  const errorKey = getEmailErrorKey(email)

  if (errorKey) {
    store.setError(errorKey)
    return
  }

  await store.requestPasswordReset(email)
}
</script>

<template>
  <AuthCard
    v-if="store.forgotComplete"
    :title="t('auth.forgotPasswordTitle')"
    :notice="t('auth.forgotSuccess')"
  >
    <RouterLink :to="{ name: 'sign-in' }">{{ t('auth.backToSignIn') }}</RouterLink>
  </AuthCard>

  <AuthCard
    v-else
    :title="t('auth.forgotPasswordTitle')"
    :description="t('auth.forgotPasswordDescription')"
    :error="errorMessage"
  >
    <form class="auth-form" @submit.prevent="onSubmit">
      <Input
        id="forgot-email"
        v-model="store.forgotForm.email"
        type="email"
        :label="t('auth.email')"
        autocomplete="email"
        required
      />

      <Button type="submit" :label="t('auth.submitForgot')" :disabled="store.loading" />
    </form>

    <RouterLink :to="{ name: 'sign-in' }">{{ t('auth.backToSignIn') }}</RouterLink>
  </AuthCard>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
</style>
