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
import VerifyEmailView from './VerifyEmailView.vue'

const Stub = { template: '<div />' }

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: Stub },
      { path: '/auth/sign-in', name: 'sign-in', component: Stub },
      { path: '/auth/verify-email', name: 'verify-email', component: Stub },
    ],
  })
}

async function mountView(query = {}) {
  const router = createTestRouter()

  await router.push({ name: 'verify-email', query })
  await router.isReady()

  const wrapper = mount(VerifyEmailView, {
    global: { plugins: [createPinia(), router, i18n] },
  })

  await flushPromises()

  return { wrapper }
}

describe('VerifyEmailView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('bestätigt die E-Mail-Adresse beim Öffnen', async () => {
    authService.verifyEmail.mockResolvedValue({ message: 'ok' })

    const { wrapper } = await mountView({ token: 'token-1' })

    expect(authService.verifyEmail).toHaveBeenCalledWith('token-1')
    expect(wrapper.text()).toContain(i18n.global.t('auth.verifyEmailSuccess'))
  })

  it('verlangt einen Token im Link', async () => {
    const { wrapper } = await mountView()

    expect(authService.verifyEmail).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain(i18n.global.t('auth.errors.tokenMissing'))
  })

  it('zeigt einen ungültigen Token an', async () => {
    authService.verifyEmail.mockRejectedValue(Object.assign(new Error('invalid'), { status: 400 }))

    const { wrapper } = await mountView({ token: 'token-1' })

    expect(wrapper.text()).toContain(i18n.global.t('auth.errors.invalidToken'))
    expect(wrapper.text()).toContain(i18n.global.t('auth.verifyEmailFailedHint'))
  })
})
