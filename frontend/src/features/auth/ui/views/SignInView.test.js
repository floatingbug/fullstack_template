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
import SignInView from './SignInView.vue'

const Stub = { template: '<div />' }

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: Stub },
      { path: '/auth/sign-in', name: 'sign-in', component: Stub },
      { path: '/auth/sign-up', name: 'sign-up', component: Stub },
      { path: '/auth/forgot-password', name: 'forgot-password', component: Stub },
    ],
  })
}

async function mountView(query = {}) {
  const router = createTestRouter()

  await router.push({ name: 'sign-in', query })
  await router.isReady()

  const wrapper = mount(SignInView, {
    global: { plugins: [createPinia(), router, i18n] },
  })

  return { wrapper, router, store: useAuthStore() }
}

async function submitWith(wrapper, identifier, password) {
  await wrapper.find('#sign-in-identifier').setValue(identifier)
  await wrapper.find('#sign-in-password').setValue(password)
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('SignInView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('verlangt Pflichtfelder', async () => {
    const { wrapper, store } = await mountView()

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(authService.signIn).not.toHaveBeenCalled()
    expect(store.errorKey).toBe('auth.errors.requiredFields')
    expect(wrapper.text()).toContain(i18n.global.t('auth.errors.requiredFields'))
  })

  it('meldet an und leitet zur Startseite', async () => {
    authService.signIn.mockResolvedValue({
      accessToken: 'token-1',
      user: { id: '1', name: 'Tommy', email: 't@example.com' },
    })

    const { wrapper, router } = await mountView()

    await submitWith(wrapper, ' Tommy ', 'Passwort1')

    expect(authService.signIn).toHaveBeenCalledWith({
      nameOrEmail: 'Tommy',
      password: 'Passwort1',
    })
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('nutzt ein sicheres Redirect-Ziel', async () => {
    authService.signIn.mockResolvedValue({
      accessToken: 'token-1',
      user: { id: '1', name: 'Tommy', email: 't@example.com' },
    })

    const { wrapper, router } = await mountView({ redirect: '/auth/sign-up' })

    await submitWith(wrapper, 'Tommy', 'Passwort1')

    expect(router.currentRoute.value.path).toBe('/auth/sign-up')
  })

  it('ignoriert externe Redirect-Ziele', async () => {
    authService.signIn.mockResolvedValue({
      accessToken: 'token-1',
      user: { id: '1', name: 'Tommy', email: 't@example.com' },
    })

    const { wrapper, router } = await mountView({ redirect: '//evil.example' })

    await submitWith(wrapper, 'Tommy', 'Passwort1')

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('zeigt falsche Zugangsdaten an', async () => {
    authService.signIn.mockRejectedValue(Object.assign(new Error('unauthorized'), { status: 401 }))

    const { wrapper, router, store } = await mountView()

    await submitWith(wrapper, 'Tommy', 'falsch')

    expect(router.currentRoute.value.name).toBe('sign-in')
    expect(store.errorKey).toBe('auth.errors.invalidCredentials')
    expect(wrapper.text()).toContain(i18n.global.t('auth.errors.invalidCredentials'))
  })

  it('bietet bei unbestätigter E-Mail das erneute Senden an', async () => {
    authService.signIn.mockRejectedValue(Object.assign(new Error('forbidden'), { status: 403 }))
    authService.resendVerificationEmail.mockResolvedValue({ message: 'ok' })

    const { wrapper, store } = await mountView()

    await submitWith(wrapper, 't@example.com', 'Passwort1')

    const resend = wrapper
      .findAll('button')
      .find((button) => button.text() === i18n.global.t('auth.resendVerification'))

    expect(resend).toBeDefined()

    await resend.trigger('click')
    await flushPromises()

    expect(authService.resendVerificationEmail).toHaveBeenCalledWith('t@example.com')
    expect(store.noticeKey).toBe('auth.verificationSent')
  })
})
