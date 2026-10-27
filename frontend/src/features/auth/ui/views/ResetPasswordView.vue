<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { Button, Input } from '@/shared/components'

import AuthCard from '../components/AuthCard.vue'
import {
  getPasswordConfirmationErrorKey,
  getPasswordErrorKey,
} from '../../services/authValidation.js'
import { useAuthStore } from '../../store/authStore.js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useAuthStore()

const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const errorMessage = computed(() => (store.errorKey ? t(store.errorKey) : ''))

async function onSubmit() {
  store.clearError()

  if (!token.value) {
    store.setError('auth.errors.tokenMissing')
    return
  }

  const errorKey =
    getPasswordErrorKey(store.resetForm.password) ??
    getPasswordConfirmationErrorKey(store.resetForm.password, store.resetForm.passwordConfirm)

  if (errorKey) {
    store.setError(errorKey)
    return
  }

  const success = await store.resetPassword({
    token: token.value,
    password: store.resetForm.password,
  })

  if (success) {
    await router.replace({ name: 'sign-in', query: { reset: 'success' } })
  }
}
</script>

<template>
  <AuthCard
    v-if="!token"
    :title="t('auth.resetPasswordTitle')"
    :error="t('auth.errors.tokenMissing')"
  >
    <RouterLink :to="{ name: 'forgot-password' }">
      {{ t('auth.forgotPassword') }}
    </RouterLink>
  </AuthCard>

  <AuthCard
    v-else
    :title="t('auth.resetPasswordTitle')"
    :description="t('auth.resetPasswordDescription')"
    :error="errorMessage"
  >
    <form class="auth-form" @submit.prevent="onSubmit">
      <Input
        id="reset-password"
        v-model="store.resetForm.password"
        type="password"
        :label="t('auth.newPassword')"
        :hint="t('auth.passwordHint')"
        autocomplete="new-password"
        required
      />

      <Input
        id="reset-password-confirm"
        v-model="store.resetForm.passwordConfirm"
        type="password"
        :label="t('auth.passwordConfirm')"
        autocomplete="new-password"
        required
      />

      <Button type="submit" :label="t('auth.submitReset')" :disabled="store.loading" />
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
