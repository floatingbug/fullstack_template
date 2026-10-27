import { apiFetch } from '@/shared/api/apiFetch.js'

export function resendVerificationEmailApi(email) {
  return apiFetch('/auth/verify-email/resend', {
    method: 'POST',
    body: { email },
    auth: false,
    retryOnUnauthorized: false,
  })
}
