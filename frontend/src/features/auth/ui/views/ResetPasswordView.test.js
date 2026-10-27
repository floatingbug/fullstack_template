import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

vi.mock('../../services/authService.js', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  getMe: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  verifyEmail: vi.fn(),
  resendVerificationEmail: vi.fn(),
  confirmEmailChange: vi.fn(),
}))

import * as authService from '../../services/authService.js'
import i18n from '@/app/i18n'
import { useAuthStore } from '../../store/authStore.js'
import ResetPasswordView from './ResetPasswordView.vue'

const Stub = { template: '<div />' }

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: Stub },
      { path: '/auth/sign-in', name: 'sign-in', component: Stub },
      { path: '/auth/forgot-password', name: 'forgot-password', component: Stub },
      { path: '/auth/reset-password', name: 'reset-password', component: Stub },
    ],
  })
}

async function mountView(query = {}) {
  const router = createTestRouter()

  await router.push({ name: 'reset-password', query })
  await router.isReady()

  const wrapper = mount(ResetPasswordView, {
    global: { plugins: [createPinia(), router, i18n] },
  })

  return { wrapper, router, store: useAuthStore() }
}

async function fillPassword(wrapper, password, confirmation) {
  await wrapper.find('#reset-password').setValue(password)
  await wrapper.find('#reset-password-confirm').setValue(confirmation)
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('ResetPasswordView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('verlangt einen Token im Link', async () => {
    const { wrapper, store } = await mountView()

    expect(wrapper.find('form').exists()).toBe(false)
    expect(store.errorKey).toBeNull()
    expect(wrapper.text()).toContain(i18n.global.t('auth.errors.tokenMissing'))
  })

  it('prüft die Passwortregeln', async () => {
    const { wrapper, store } = await mountView({ token: 'token-1' })

    await fillPassword(wrapper, 'kurz', 'kurz')

    expect(authService.resetPassword).not.toHaveBeenCalled()
    expect(store.errorKey).toBe('auth.errors.passwordLength')
  })

  it('prüft die Wiederholung', async () => {
    const { wrapper, store } = await mountView({ token: 'token-1' })

    await fillPassword(wrapper, 'Passwort1', 'Passwort2')

    expect(authService.resetPassword).not.toHaveBeenCalled()
    expect(store.errorKey).toBe('auth.errors.passwordMismatch')
  })

  it('setzt das Passwort und leitet zur Anmeldung', async () => {
    authService.resetPassword.mockResolvedValue({ message: 'ok' })

    const { wrapper, router } = await mountView({ token: 'token-1' })

    await fillPassword(wrapper, 'Passwort1', 'Passwort1')

    expect(authService.resetPassword).toHaveBeenCalledWith({
      token: 'token-1',
      password: 'Passwort1',
    })
    expect(router.currentRoute.value.name).toBe('sign-in')
    expect(router.currentRoute.value.query.reset).toBe('success')
  })

  it('zeigt einen ungültigen Token an', async () => {
    authService.resetPassword.mockRejectedValue(
      Object.assign(new Error('invalid'), { status: 400 }),
    )

    const { wrapper, store } = await mountView({ token: 'token-1' })

    await fillPassword(wrapper, 'Passwort1', 'Passwort1')

    expect(store.errorKey).toBe('auth.errors.resetFailed')
    expect(wrapper.text()).toContain(i18n.global.t('auth.errors.resetFailed'))
  })
})
