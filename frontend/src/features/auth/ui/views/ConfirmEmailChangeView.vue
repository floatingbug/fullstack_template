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

const noticeMessage = computed(() => {
  if (!store.confirmedEmail) {
    return t('auth.confirmEmailSuccessGeneric')
  }

  return t('auth.confirmEmailSuccess', { email: store.confirmedEmail })
})

onMounted(async () => {
  store.clearError()

  if (!token.value) {
    store.setError('auth.errors.tokenMissing')
    finished.value = true
    return
  }

  success.value = await store.confirmEmailChange(token.value)
  finished.value = true
})
</script>

<template>
  <AuthCard
    v-if="!finished"
    :title="t('auth.confirmEmailChangeTitle')"
    :notice="t('auth.confirmEmailLoading')"
  />

  <AuthCard v-else-if="success" :title="t('auth.confirmEmailChangeTitle')" :notice="noticeMessage">
    <RouterLink :to="{ name: 'home' }">{{ t('auth.backHome') }}</RouterLink>
  </AuthCard>

  <AuthCard v-else :title="t('auth.confirmEmailChangeTitle')" :error="errorMessage">
    <p class="auth-text">{{ t('auth.confirmEmailFailedHint') }}</p>
    <RouterLink :to="{ name: 'home' }">{{ t('auth.backHome') }}</RouterLink>
  </AuthCard>
</template>

<style scoped>
.auth-text {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
</style>
