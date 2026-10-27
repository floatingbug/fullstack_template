import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/shared/api/authSession.js', () => ({
  getAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
  clearAccessToken: vi.fn(),
  refreshAccessToken: vi.fn(),
}))

vi.mock('@/features/auth/services/authService.js', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  getMe: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  verifyEmail: vi.fn(),
  resendVerificationEmail: vi.fn(),
  confirmEmailChange: vi.fn(),
}))

import * as authService from '@/features/auth/services/authService.js'
import { clearAccessToken, refreshAccessToken, setAccessToken } from '@/shared/api/authSession.js'
import { useAuthStore } from './authStore.js'

function apiError(status) {
  return Object.assign(new Error('backend message'), { status })
}

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    refreshAccessToken.mockResolvedValue(null)
  })

  it('startet ohne bekannte Session', () => {
    const store = useAuthStore()

    expect(store.status).toBe('unknown')
    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBeNull()
  })

  it('wird ohne Refresh-Token zum Gast', async () => {
    const store = useAuthStore()

    await expect(store.restoreSession()).resolves.toBe('guest')
    expect(store.status).toBe('guest')
    expect(authService.getMe).not.toHaveBeenCalled()
  })

  it('stellt die Session mit gültigem Token wieder her', async () => {
    refreshAccessToken.mockResolvedValue('token-1')
    authService.getMe.mockResolvedValue({ id: '1', name: 'Tommy', email: 't@example.com' })

    const store = useAuthStore()

    await expect(store.restoreSession()).resolves.toBe('authenticated')
    expect(store.user).toEqual({ id: '1', name: 'Tommy', email: 't@example.com' })
    expect(store.isAuthenticated).toBe(true)
  })

  it('verwirft den Token, wenn der User nicht geladen werden kann', async () => {
    refreshAccessToken.mockResolvedValue('token-1')
    authService.getMe.mockRejectedValue(apiError(401))

    const store = useAuthStore()

    await expect(store.restoreSession()).resolves.toBe('guest')
    expect(store.status).toBe('guest')
    expect(store.user).toBeNull()
    expect(clearAccessToken).toHaveBeenCalledTimes(1)
  })

  it('stellt die Session nur einmal wieder her', async () => {
    const store = useAuthStore()

    await store.restoreSession()
    await store.restoreSession()

    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
  })

  it('meldet an und speichert Token und User', async () => {
    authService.signIn.mockResolvedValue({
      accessToken: 'token-1',
      user: { id: '1', name: 'Tommy', email: 't@example.com' },
    })

    const store = useAuthStore()
    store.signInForm.password = 'Passwort1'

    await expect(store.signIn({ nameOrEmail: 'Tommy', password: 'Passwort1' })).resolves.toBe(true)

    expect(setAccessToken).toHaveBeenCalledWith('token-1')
    expect(store.status).toBe('authenticated')
    expect(store.user).toEqual({ id: '1', name: 'Tommy', email: 't@example.com' })
    expect(store.signInForm.password).toBe('')
    expect(store.errorKey).toBeNull()
  })

  it('übersetzt Anmeldefehler in einen Key', async () => {
    authService.signIn.mockRejectedValue(apiError(401))

    const store = useAuthStore()

    await expect(store.signIn({ nameOrEmail: 'Tommy', password: 'falsch' })).resolves.toBe(false)

    expect(store.status).toBe('unknown')
    expect(store.errorKey).toBe('auth.errors.invalidCredentials')
    expect(store.loading).toBe(false)
  })

  it('schließt die Registrierung ohne automatische Anmeldung ab', async () => {
    authService.signUp.mockResolvedValue({ message: 'ok' })

    const store = useAuthStore()
    store.signUpForm.password = 'Passwort1'
    store.signUpForm.passwordConfirm = 'Passwort1'

    await expect(
      store.signUp({ name: 'Tommy', email: 't@example.com', password: 'Passwort1' }),
    ).resolves.toBe(true)

    expect(store.signUpComplete).toBe(true)
    expect(store.pendingVerificationEmail).toBe('t@example.com')
    expect(store.signUpForm.password).toBe('')
    expect(store.signUpForm.passwordConfirm).toBe('')
    expect(store.isAuthenticated).toBe(false)
  })

  it('übersetzt Registrierungsfehler in einen Key', async () => {
    authService.signUp.mockRejectedValue(apiError(409))

    const store = useAuthStore()

    await expect(
      store.signUp({ name: 'Tommy', email: 't@example.com', password: 'Passwort1' }),
    ).resolves.toBe(false)

    expect(store.errorKey).toBe('auth.errors.accountExists')
    expect(store.signUpComplete).toBe(false)
  })

  it('meldet lokal ab, auch wenn der Request fehlschlägt', async () => {
    authService.signOut.mockRejectedValue(new Error('offline'))

    const store = useAuthStore()
    store.status = 'authenticated'
    store.user = { id: '1' }
    store.signUpComplete = true
    store.pendingVerificationEmail = 't@example.com'

    await store.signOut()

    expect(clearAccessToken).toHaveBeenCalledTimes(1)
    expect(store.status).toBe('guest')
    expect(store.user).toBeNull()
    expect(store.signUpComplete).toBe(false)
    expect(store.pendingVerificationEmail).toBe('')
    expect(store.loading).toBe(false)
  })

  it('fordert einen Passwort-Reset an', async () => {
    authService.forgotPassword.mockResolvedValue({ message: 'ok' })

    const store = useAuthStore()

    await expect(store.requestPasswordReset('t@example.com')).resolves.toBe(true)
    expect(store.forgotComplete).toBe(true)
    expect(authService.forgotPassword).toHaveBeenCalledWith('t@example.com')
  })

  it('setzt ein neues Passwort und leert das Formular', async () => {
    authService.resetPassword.mockResolvedValue({ message: 'ok' })

    const store = useAuthStore()
    store.resetForm.password = 'NeuesPasswort1'
    store.resetForm.passwordConfirm = 'NeuesPasswort1'

    await expect(
      store.resetPassword({ token: 'token-1', password: 'NeuesPasswort1' }),
    ).resolves.toBe(true)

    expect(store.noticeKey).toBe('auth.resetSuccess')
    expect(store.resetForm.password).toBe('')
    expect(store.resetForm.passwordConfirm).toBe('')
  })

  it('übersetzt Fehler beim Passwort-Reset', async () => {
    authService.resetPassword.mockRejectedValue(apiError(400))

    const store = useAuthStore()

    await expect(
      store.resetPassword({ token: 'token-1', password: 'NeuesPasswort1' }),
    ).resolves.toBe(false)

    expect(store.errorKey).toBe('auth.errors.resetFailed')
  })

  it('bestätigt die E-Mail-Adresse', async () => {
    authService.verifyEmail.mockResolvedValue({ message: 'ok' })

    const store = useAuthStore()

    await expect(store.verifyEmail('token-1')).resolves.toBe(true)
    expect(store.noticeKey).toBe('auth.verifyEmailSuccess')
  })

  it('übersetzt ungültige E-Mail-Token', async () => {
    authService.verifyEmail.mockRejectedValue(apiError(400))

    const store = useAuthStore()

    await expect(store.verifyEmail('token-1')).resolves.toBe(false)
    expect(store.errorKey).toBe('auth.errors.invalidToken')
  })

  it('bestätigt eine E-Mail-Änderung und aktualisiert den User', async () => {
    authService.confirmEmailChange.mockResolvedValue({
      success: true,
      newEmail: 'neu@example.com',
    })
    authService.getMe.mockResolvedValue({
      id: '1',
      name: 'Tommy',
      email: 'neu@example.com',
    })

    const store = useAuthStore()
    store.status = 'authenticated'
    store.user = { id: '1', name: 'Tommy', email: 'alt@example.com' }

    await expect(store.confirmEmailChange('token-1')).resolves.toBe(true)

    expect(store.confirmedEmail).toBe('neu@example.com')
    expect(store.noticeKey).toBe('auth.confirmEmailSuccess')
    expect(store.user.email).toBe('neu@example.com')
  })

  it('fordert ohne Anmeldung keinen User erneut an', async () => {
    authService.confirmEmailChange.mockResolvedValue({ newEmail: 'neu@example.com' })

    const store = useAuthStore()

    await store.confirmEmailChange('token-1')

    expect(authService.getMe).not.toHaveBeenCalled()
  })

  it('behält den User, wenn das Neuladen fehlschlägt', async () => {
    authService.getMe.mockRejectedValue(apiError(500))

    const store = useAuthStore()
    store.status = 'authenticated'
    store.user = { id: '1', name: 'Tommy', email: 't@example.com' }

    await store.refreshUser()

    expect(store.user).toEqual({ id: '1', name: 'Tommy', email: 't@example.com' })
  })

  it('sendet die Verifizierungsmail erneut', async () => {
    authService.resendVerificationEmail.mockResolvedValue({ message: 'ok' })

    const store = useAuthStore()

    await expect(store.resendVerification('t@example.com')).resolves.toBe(true)
    expect(store.noticeKey).toBe('auth.verificationSent')
  })

  it('setzt und löscht Fehler und Hinweise', () => {
    const store = useAuthStore()

    store.setError('auth.errors.generic')
    expect(store.errorKey).toBe('auth.errors.generic')

    store.setNotice('auth.resetSuccess')
    expect(store.noticeKey).toBe('auth.resetSuccess')
    expect(store.errorKey).toBeNull()

    store.setError('auth.errors.network')
    expect(store.errorKey).toBe('auth.errors.network')
    expect(store.noticeKey).toBeNull()

    store.clearError()
    expect(store.errorKey).toBeNull()
  })
})
