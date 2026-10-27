import { apiFetch } from '@/shared/api/apiFetch.js'

export function forgotPasswordApi(email) {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: { email },
    auth: false,
    retryOnUnauthorized: false,
  })
}
