<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Button, Input } from '@/shared/components'

import AuthCard from '../components/AuthCard.vue'
import {
  getEmailErrorKey,
  getNameErrorKey,
  getPasswordConfirmationErrorKey,
  getPasswordErrorKey,
} from '../../services/authValidation.js'
import { useAuthStore } from '../../store/authStore.js'

const { t } = useI18n()
const store = useAuthStore()

const errorMessage = computed(() => (store.errorKey ? t(store.errorKey) : ''))

function validate() {
  const form = store.signUpForm

  const errorKey =
    getNameErrorKey(form.name) ??
    getEmailErrorKey(form.email) ??
    getPasswordErrorKey(form.password) ??
    getPasswordConfirmationErrorKey(form.password, form.passwordConfirm)

  if (errorKey) {
    store.setError(errorKey)
    return false
  }

  return true
}

async function onSubmit() {
  store.clearError()

  if (!validate()) {
    return
  }

  await store.signUp({
    name: store.signUpForm.name.trim(),
    email: store.signUpForm.email.trim().toLowerCase(),
    password: store.signUpForm.password,
  })
}
</script>

<template>
  <AuthCard
    v-if="store.signUpComplete"
    :title="t('auth.signUpSuccessTitle')"
    :notice="t('auth.signUpSuccess', { email: store.pendingVerificationEmail })"
  >
    <p class="auth-text">{{ t('auth.signUpSuccessHint') }}</p>
    <RouterLink :to="{ name: 'sign-in' }">{{ t('auth.backToSignIn') }}</RouterLink>
  </AuthCard>

  <AuthCard v-else :title="t('auth.signUpTitle')" :error="errorMessage">
    <form class="auth-form" @submit.prevent="onSubmit">
      <Input
        id="sign-up-name"
        v-model="store.signUpForm.name"
        :label="t('auth.name')"
        autocomplete="username"
        required
      />

      <Input
        id="sign-up-email"
        v-model="store.signUpForm.email"
        type="email"
        :label="t('auth.email')"
        autocomplete="email"
        required
      />

      <Input
        id="sign-up-password"
        v-model="store.signUpForm.password"
        type="password"
        :label="t('auth.password')"
        :hint="t('auth.passwordHint')"
        autocomplete="new-password"
        required
      />

      <Input
        id="sign-up-password-confirm"
        v-model="store.signUpForm.passwordConfirm"
        type="password"
        :label="t('auth.passwordConfirm')"
        autocomplete="new-password"
        required
      />

      <Button type="submit" :label="t('auth.signUp')" :disabled="store.loading" />
    </form>

    <p class="auth-text">
      {{ t('auth.hasAccount') }}
      <RouterLink :to="{ name: 'sign-in' }">{{ t('auth.signIn') }}</RouterLink>
    </p>
  </AuthCard>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.auth-text {
  margin: 0;
  font-size: var(--font-size-sm);
}
</style>
