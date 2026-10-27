import { apiFetch } from '@/shared/api/apiFetch.js'

export function confirmEmailChangeApi(token) {
  return apiFetch(`/account/confirm-email?token=${encodeURIComponent(token)}`, {
    auth: false,
    retryOnUnauthorized: false,
  })
}
