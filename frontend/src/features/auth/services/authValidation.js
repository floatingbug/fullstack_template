const NAME_MIN_LENGTH = 3
const NAME_MAX_LENGTH = 50
const NAME_PATTERN = /^[a-zA-Z0-9._-]+$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function getNameErrorKey(name) {
  const value = typeof name === 'string' ? name.trim() : ''

  if (value.length < NAME_MIN_LENGTH || value.length > NAME_MAX_LENGTH) {
    return 'auth.errors.nameLength'
  }

  if (!NAME_PATTERN.test(value)) {
    return 'auth.errors.nameFormat'
  }

  return null
}

export function getEmailErrorKey(email) {
  const value = typeof email === 'string' ? email.trim() : ''

  if (!EMAIL_PATTERN.test(value)) {
    return 'auth.errors.emailFormat'
  }

  return null
}

export function getPasswordErrorKey(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return 'auth.errors.passwordLength'
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return 'auth.errors.passwordRequirements'
  }

  return null
}

export function getPasswordConfirmationErrorKey(password, confirmation) {
  if (password !== confirmation) {
    return 'auth.errors.passwordMismatch'
  }

  return null
}
