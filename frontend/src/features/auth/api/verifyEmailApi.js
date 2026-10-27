import { apiFetch } from '@/shared/api/apiFetch.js'

export function verifyEmailApi(token) {
  return apiFetch(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
    auth: false,
    retryOnUnauthorized: false,
  })
}
