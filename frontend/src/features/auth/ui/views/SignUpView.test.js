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
import SignUpView from './SignUpView.vue'

const Stub = { template: '<div />' }

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: Stub },
      { path: '/auth/sign-in', name: 'sign-in', component: Stub },
      { path: '/auth/sign-up', name: 'sign-up', component: Stub },
    ],
  })
}

async function mountView() {
  const router = createTestRouter()

  await router.push({ name: 'sign-up' })
  await router.isReady()

  const wrapper = mount(SignUpView, {
    global: { plugins: [createPinia(), router, i18n] },
  })

  return { wrapper, router, store: useAuthStore() }
}

async function fillForm(wrapper, { name, email, password, passwordConfirm }) {
  await wrapper.find('#sign-up-name').setValue(name)
  await wrapper.find('#sign-up-email').setValue(email)
  await wrapper.find('#sign-up-password').setValue(password)
  await wrapper.find('#sign-up-password-confirm').setValue(passwordConfirm)
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('SignUpView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('prüft die Eingaben vor dem Request', async () => {
    const { wrapper, store } = await mountView()

    await fillForm(wrapper, {
      name: 'Tommy',
      email: 't@example.com',
      password: 'kurz',
      passwordConfirm: 'kurz',
    })

    expect(authService.signUp).not.toHaveBeenCalled()
    expect(store.errorKey).toBe('auth.errors.passwordLength')
    expect(wrapper.text()).toContain(i18n.global.t('auth.errors.passwordLength'))
  })

  it('meldet nicht übereinstimmende Passwörter', async () => {
    const { wrapper, store } = await mountView()

    await fillForm(wrapper, {
      name: 'Tommy',
      email: 't@example.com',
      password: 'Passwort1',
      passwordConfirm: 'Passwort2',
    })

    expect(authService.signUp).not.toHaveBeenCalled()
    expect(store.errorKey).toBe('auth.errors.passwordMismatch')
  })

  it('registriert mit normalisierten Werten und zeigt den Hinweis', async () => {
    authService.signUp.mockResolvedValue({ message: 'ok' })

    const { wrapper, store } = await mountView()

    await fillForm(wrapper, {
      name: ' Tommy ',
      email: ' Test@Example.com ',
      password: 'Passwort1',
      passwordConfirm: 'Passwort1',
    })

    expect(authService.signUp).toHaveBeenCalledWith({
      name: 'Tommy',
      email: 'test@example.com',
      password: 'Passwort1',
    })
    expect(store.signUpComplete).toBe(true)
    expect(store.isAuthenticated).toBe(false)
    expect(wrapper.text()).toContain(
      i18n.global.t('auth.signUpSuccess', { email: 'test@example.com' }),
    )
  })

  it('zeigt einen bestehenden Account an', async () => {
    authService.signUp.mockRejectedValue(Object.assign(new Error('conflict'), { status: 409 }))

    const { wrapper } = await mountView()

    await fillForm(wrapper, {
      name: 'Tommy',
      email: 't@example.com',
      password: 'Passwort1',
      passwordConfirm: 'Passwort1',
    })

    expect(wrapper.text()).toContain(i18n.global.t('auth.errors.accountExists'))
  })
})
