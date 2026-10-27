import { describe, expect, it } from 'vitest'

import { getAuthErrorKey } from './authErrors.js'

function apiError(status) {
  return Object.assign(new Error('backend message'), { status })
}

describe('getAuthErrorKey', () => {
  it('meldet Netzwerkfehler ohne Status', () => {
    expect(getAuthErrorKey(new Error('offline'), 'signIn')).toBe('auth.errors.network')
    expect(getAuthErrorKey(undefined, 'signUp')).toBe('auth.errors.network')
  })

  it('übersetzt Anmeldefehler', () => {
    expect(getAuthErrorKey(apiError(401), 'signIn')).toBe('auth.errors.invalidCredentials')
    expect(getAuthErrorKey(apiError(403), 'signIn')).toBe('auth.errors.emailNotVerified')
    expect(getAuthErrorKey(apiError(400), 'signIn')).toBe('auth.errors.invalidInput')
  })

  it('übersetzt Registrierungsfehler', () => {
    expect(getAuthErrorKey(apiError(409), 'signUp')).toBe('auth.errors.accountExists')
    expect(getAuthErrorKey(apiError(502), 'signUp')).toBe('auth.errors.mailFailed')
    expect(getAuthErrorKey(apiError(400), 'signUp')).toBe('auth.errors.invalidInput')
  })

  it('übersetzt Passwort-Fehler', () => {
    expect(getAuthErrorKey(apiError(400), 'forgotPassword')).toBe('auth.errors.invalidInput')
    expect(getAuthErrorKey(apiError(400), 'resetPassword')).toBe('auth.errors.resetFailed')
  })

  it('übersetzt Token-Fehler', () => {
    expect(getAuthErrorKey(apiError(400), 'verifyEmail')).toBe('auth.errors.invalidToken')
    expect(getAuthErrorKey(apiError(400), 'confirmEmailChange')).toBe('auth.errors.invalidToken')
    expect(getAuthErrorKey(apiError(409), 'confirmEmailChange')).toBe('auth.errors.emailTaken')
  })

  it('übersetzt Mailfehler beim erneuten Senden', () => {
    expect(getAuthErrorKey(apiError(502), 'resendVerification')).toBe('auth.errors.mailFailed')
  })

  it('fällt auf den generischen Fehler zurück', () => {
    expect(getAuthErrorKey(apiError(500), 'signIn')).toBe('auth.errors.generic')
    expect(getAuthErrorKey(apiError(404), 'signUp')).toBe('auth.errors.generic')
    expect(getAuthErrorKey(apiError(500), 'unknown')).toBe('auth.errors.generic')
  })
})
