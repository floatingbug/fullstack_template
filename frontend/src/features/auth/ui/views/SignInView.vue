<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { Button, Input } from '@/shared/components'
import { safeRedirect } from '@/shared/router/safeRedirect.js'

import AuthCard from '../components/AuthCard.vue'
import { useAuthStore } from '../../store/authStore.js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useAuthStore()

const errorMessage = computed(() => (store.errorKey ? t(store.errorKey) : ''))

const noticeMessage = computed(() => {
  if (store.noticeKey) {
    return t(store.noticeKey)
  }

  if (route.query.reset === 'success') {
    return t('auth.resetSuccess')
  }

  return ''
})

const canResend = computed(
  () =>
    store.errorKey === 'auth.errors.emailNotVerified' && store.signInForm.nameOrEmail.includes('@'),
)

async function onSubmit() {
  store.clearError()

  const nameOrEmail = store.signInForm.nameOrEmail.trim()

  if (!nameOrEmail || !store.signInForm.password) {
    store.setError('auth.errors.requiredFields')
    return
  }

  const success = await store.signIn({
    nameOrEmail,
    password: store.signInForm.password,
  })

  if (success) {
    await router.replace(safeRedirect(route.query.redirect))
  }
}

async function onResend() {
  await store.resendVerification(store.signInForm.nameOrEmail.trim())
}
</script>

<template>
  <AuthCard :title="t('auth.signInTitle')" :error="errorMessage" :notice="noticeMessage">
    <form class="auth-form" @submit.prevent="onSubmit">
      <Input
        id="sign-in-identifier"
        v-model="store.signInForm.nameOrEmail"
        :label="t('auth.emailOrName')"
        autocomplete="username"
        required
      />

      <Input
        id="sign-in-password"
        v-model="store.signInForm.password"
        type="password"
        :label="t('auth.password')"
        autocomplete="current-password"
        required
      />

      <Button type="submit" :label="t('auth.signIn')" :disabled="store.loading" />

      <Button
        v-if="canResend"
        type="button"
        severity="secondary"
        :label="t('auth.resendVerification')"
        :disabled="store.loading"
        @click="onResend"
      />
    </form>

    <div class="auth-links">
      <p>
        <RouterLink :to="{ name: 'forgot-password' }">
          {{ t('auth.forgotPassword') }}
        </RouterLink>
      </p>
      <p>
        {{ t('auth.noAccount') }}
        <RouterLink :to="{ name: 'sign-up' }">{{ t('auth.signUp') }}</RouterLink>
      </p>
    </div>
  </AuthCard>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.auth-links {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  font-size: 0.875rem;
}

.auth-links p {
  margin: 0;
}
</style>
