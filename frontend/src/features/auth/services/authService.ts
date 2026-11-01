import type { ConfirmEmailChangeResponse, MessageResponse, SignInResponse, User } from '@/shared/api/types'
import { signInApi } from '../api/signInApi'
import { signUpApi } from '../api/signUpApi'
import { signOutApi } from '../api/signOutApi'
import { getMeApi } from '../api/getMeApi'
import { forgotPasswordApi } from '../api/forgotPasswordApi'
import { resetPasswordApi } from '../api/resetPasswordApi'
import { verifyEmailApi } from '../api/verifyEmailApi'
import { resendVerificationEmailApi } from '../api/resendVerificationEmailApi'
import { confirmEmailChangeApi } from '../api/confirmEmailChangeApi'

export function signIn({ nameOrEmail, password }: { nameOrEmail: string; password: string }): Promise<SignInResponse> {
  return signInApi({ nameOrEmail, password })
}

export function signUp({ name, email, password }: { name: string; email: string; password: string }): Promise<MessageResponse> {
  return signUpApi({ name, email, password })
}

export function signOut(): Promise<null> {
  return signOutApi()
}

export function getMe(): Promise<User> {
  return getMeApi()
}

export function forgotPassword(email: string): Promise<MessageResponse> {
  return forgotPasswordApi(email)
}

export function resetPassword({ token, password }: { token: string; password: string }): Promise<MessageResponse> {
  return resetPasswordApi({ token, password })
}

export function verifyEmail(token: string): Promise<MessageResponse> {
  return verifyEmailApi(token)
}

export function resendVerificationEmail(email: string): Promise<MessageResponse> {
  return resendVerificationEmailApi(email)
}

export function confirmEmailChange(token: string): Promise<ConfirmEmailChangeResponse> {
  return confirmEmailChangeApi(token)
}
