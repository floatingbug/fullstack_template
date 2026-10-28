<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import AuthCard from '../components/AuthCard.vue'
import { useAuthStore } from '../../store/authStore.js'

const { t } = useI18n()
const route = useRoute()
const store = useAuthStore()

const finished = ref(false)
const success = ref(false)

const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const errorMessage = computed(() => (store.errorKey ? t(store.errorKey) : ''))

onMounted(async () => {
  store.clearError()

  if (!token.value) {
    store.setError('auth.errors.tokenMissing')
    finished.value = true
    return
  }

  success.value = await store.verifyEmail(token.value)
  finished.value = true
})
</script>

<template>
  <AuthCard
    v-if="!finished"
    :title="t('auth.verifyEmailTitle')"
    :notice="t('auth.verifyEmailLoading')"
  />

  <AuthCard
    v-else-if="success"
    :title="t('auth.verifyEmailTitle')"
    :notice="t('auth.verifyEmailSuccess')"
  >
    <RouterLink :to="{ name: 'sign-in' }">{{ t('auth.backToSignIn') }}</RouterLink>
  </AuthCard>

  <AuthCard v-else :title="t('auth.verifyEmailTitle')" :error="errorMessage">
    <p class="auth-text">{{ t('auth.verifyEmailFailedHint') }}</p>
    <RouterLink :to="{ name: 'sign-in' }">{{ t('auth.backToSignIn') }}</RouterLink>
  </AuthCard>
</template>

<style scoped>
.auth-text {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
</style>
