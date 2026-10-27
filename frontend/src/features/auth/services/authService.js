import { signInApi } from '../api/signInApi.js'
import { signUpApi } from '../api/signUpApi.js'
import { signOutApi } from '../api/signOutApi.js'
import { getMeApi } from '../api/getMeApi.js'
import { forgotPasswordApi } from '../api/forgotPasswordApi.js'
import { resetPasswordApi } from '../api/resetPasswordApi.js'
import { verifyEmailApi } from '../api/verifyEmailApi.js'
import { resendVerificationEmailApi } from '../api/resendVerificationEmailApi.js'
import { confirmEmailChangeApi } from '../api/confirmEmailChangeApi.js'

export function signIn({ nameOrEmail, password }) {
  return signInApi({ nameOrEmail, password })
}

export function signUp({ name, email, password }) {
  return signUpApi({ name, email, password })
}

export function signOut() {
  return signOutApi()
}

export function getMe() {
  return getMeApi()
}

export function forgotPassword(email) {
  return forgotPasswordApi(email)
}

export function resetPassword({ token, password }) {
  return resetPasswordApi({ token, password })
}

export function verifyEmail(token) {
  return verifyEmailApi(token)
}

export function resendVerificationEmail(email) {
  return resendVerificationEmailApi(email)
}

export function confirmEmailChange(token) {
  return confirmEmailChangeApi(token)
}
