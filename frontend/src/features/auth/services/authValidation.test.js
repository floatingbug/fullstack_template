import { describe, expect, it } from 'vitest'

import {
  getEmailErrorKey,
  getNameErrorKey,
  getPasswordConfirmationErrorKey,
  getPasswordErrorKey,
} from './authValidation.js'

describe('getNameErrorKey', () => {
  it('akzeptiert gültige Namen', () => {
    expect(getNameErrorKey('tommy')).toBeNull()
    expect(getNameErrorKey('Tommy_01-x.y')).toBeNull()
  })

  it('prüft die Länge nach dem Trimmen', () => {
    expect(getNameErrorKey('  ab  ')).toBe('auth.errors.nameLength')
    expect(getNameErrorKey('a'.repeat(51))).toBe('auth.errors.nameLength')
    expect(getNameErrorKey(undefined)).toBe('auth.errors.nameLength')
  })

  it('lehnt ungültige Zeichen ab', () => {
    expect(getNameErrorKey('Tom my')).toBe('auth.errors.nameFormat')
    expect(getNameErrorKey('Tommy!')).toBe('auth.errors.nameFormat')
    expect(getNameErrorKey('Tommy@example')).toBe('auth.errors.nameFormat')
  })
})

describe('getEmailErrorKey', () => {
  it('akzeptiert gültige Adressen', () => {
    expect(getEmailErrorKey('test@example.com')).toBeNull()
    expect(getEmailErrorKey(' test@example.com ')).toBeNull()
  })

  it('lehnt ungültige Adressen ab', () => {
    expect(getEmailErrorKey('test')).toBe('auth.errors.emailFormat')
    expect(getEmailErrorKey('test@example')).toBe('auth.errors.emailFormat')
    expect(getEmailErrorKey('test example.com')).toBe('auth.errors.emailFormat')
    expect(getEmailErrorKey(null)).toBe('auth.errors.emailFormat')
  })
})

describe('getPasswordErrorKey', () => {
  it('akzeptiert Passwörter mit Groß-, Kleinbuchstaben und Zahl', () => {
    expect(getPasswordErrorKey('Passwort1')).toBeNull()
    expect(getPasswordErrorKey('aA1aaaaa')).toBeNull()
  })

  it('prüft die Länge ohne Trimmen', () => {
    expect(getPasswordErrorKey('Aa1')).toBe('auth.errors.passwordLength')
    expect(getPasswordErrorKey('a'.repeat(129))).toBe('auth.errors.passwordLength')
    expect(getPasswordErrorKey(undefined)).toBe('auth.errors.passwordLength')
  })

  it('verlangt Groß- und Kleinbuchstaben sowie eine Zahl', () => {
    expect(getPasswordErrorKey('passwort1')).toBe('auth.errors.passwordRequirements')
    expect(getPasswordErrorKey('PASSWORT1')).toBe('auth.errors.passwordRequirements')
    expect(getPasswordErrorKey('Passwort')).toBe('auth.errors.passwordRequirements')
  })
})

describe('getPasswordConfirmationErrorKey', () => {
  it('vergleicht Passwort und Wiederholung', () => {
    expect(getPasswordConfirmationErrorKey('Passwort1', 'Passwort1')).toBeNull()
    expect(getPasswordConfirmationErrorKey('Passwort1', 'Passwort2')).toBe(
      'auth.errors.passwordMismatch',
    )
  })
})
