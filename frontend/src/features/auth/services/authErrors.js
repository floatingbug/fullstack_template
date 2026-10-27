/**
 * Übersetzt API-Fehler in i18n-Keys. Backend-Meldungen sind englisch und
 * werden bewusst nicht direkt angezeigt.
 *
 * @param {Error & { status?: number }} error
 * @param {'signIn'|'signUp'|'signOut'|'forgotPassword'|'resetPassword'|'verifyEmail'|'confirmEmailChange'|'resendVerification'|'generic'} action
 * @returns {string} i18n-Key
 */
export function getAuthErrorKey(error, action = 'generic') {
  const status = error?.status

  if (!status) {
    return 'auth.errors.network'
  }

  if (action === 'signIn') {
    if (status === 401) return 'auth.errors.invalidCredentials'
    if (status === 403) return 'auth.errors.emailNotVerified'
    if (status === 400) return 'auth.errors.invalidInput'
  }

  if (action === 'signUp') {
    if (status === 409) return 'auth.errors.accountExists'
    if (status === 502) return 'auth.errors.mailFailed'
    if (status === 400) return 'auth.errors.invalidInput'
  }

  if (action === 'forgotPassword' && status === 400) {
    return 'auth.errors.invalidInput'
  }

  if (action === 'resetPassword' && status === 400) {
    return 'auth.errors.resetFailed'
  }

  if (action === 'verifyEmail' && status === 400) {
    return 'auth.errors.invalidToken'
  }

  if (action === 'confirmEmailChange') {
    if (status === 400) return 'auth.errors.invalidToken'
    if (status === 409) return 'auth.errors.emailTaken'
  }

  if (action === 'resendVerification' && status === 502) {
    return 'auth.errors.mailFailed'
  }

  return 'auth.errors.generic'
}
