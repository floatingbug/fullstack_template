import { apiFetch } from '@/shared/api/apiFetch.js'

export function resetPasswordApi({ token, password }) {
  return apiFetch('/auth/reset-password', {
    method: 'POST',
    body: { token, password },
    auth: false,
    retryOnUnauthorized: false,
  })
}
